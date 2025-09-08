
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { KeycloakService } from '../../keycloak/keycloak.service';
import { UsersRepository } from '../../database/repositories/users.repository';

export interface JwtPayload {
    sub: string;
    email: string;
    given_name: string;
    family_name: string;
    realm_access?: {
        roles: string[];
    };
    resource_access?: any;
    exp: number;
    iat: number;
}

export interface AuthenticatedUser {
    id: string;
    keycloakId: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    isActive: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);

    constructor(
        private configService: ConfigService,
        private keycloakService: KeycloakService,
        private usersRepository: UsersRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            algorithms: ['RS256'],
            secretOrKeyProvider: async (request: any, rawJwtToken: string, done: (error: any, key?: string) => void) => {
                try {
                    const decoded = JSON.parse(
                        Buffer.from(rawJwtToken.split('.')[0], 'base64').toString(),
                    );

                    const publicKey = await this.keycloakService.getPublicKey(decoded.kid);
                    done(null, publicKey); // ← null helyett undefined
                } catch (error) {
                    this.logger.error('Failed to get JWT signing key:', error);
                    done(new UnauthorizedException('Invalid token')); // ← második paraméter elhagyása
                }
            },
        });
    }

    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
        try {
            this.logger.debug(`Validating JWT for user: ${payload.email}`);

            const userData = this.keycloakService.extractUserData(payload);

            let user = await this.usersRepository.findByKeycloakId(userData.keycloakId);

            if (!user) {
                this.logger.log(`Creating new user from Keycloak: ${userData.email}`);
                user = await this.usersRepository.syncFromKeycloak({
                    keycloakId: userData.keycloakId,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                });
            } else {
                const needsUpdate =
                    user.email !== userData.email ||
                    user.firstName !== userData.firstName ||
                    user.lastName !== userData.lastName;

                if (needsUpdate) {
                    this.logger.log(`Updating user data: ${userData.email}`);
                    user = await this.usersRepository.update(user.id, {
                        email: userData.email,
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                    });
                }
            }

            if (!user.isActive) {
                this.logger.warn(`Inactive user attempted login: ${user.email}`);
                throw new UnauthorizedException('User account is inactive');
            }

            const authenticatedUser: AuthenticatedUser = {
                id: user.id,
                keycloakId: user.keycloakId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: userData.roles,
                isActive: user.isActive,
            };

            this.logger.debug(`User authenticated successfully: ${user.email}`);
            return authenticatedUser;

        } catch (error) {
            this.logger.error('JWT validation failed:', error);
            throw new UnauthorizedException('Invalid token or user data');
        }
    }
}