
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwksClient from 'jwks-rsa'; // ← Default import helyett

export interface KeycloakUser {
    sub: string;
    email: string;
    given_name: string;
    family_name: string;
    realm_access?: {
        roles: string[];
    };
    resource_access?: {
        [key: string]: {
            roles: string[];
        };
    };
}

@Injectable()
export class KeycloakService {
    private readonly logger = new Logger(KeycloakService.name);
    private readonly jwksClient: jwksClient.JwksClient;
    private readonly keycloakUrl: string;
    private readonly realm: string;

    constructor(private configService: ConfigService) {
        // ← Non-null assertion vagy default értékek
        this.keycloakUrl = this.configService.get<string>('KEYCLOAK_URL') || 'http://keycloak:8080';
        this.realm = this.configService.get<string>('KEYCLOAK_REALM') || 'team-dashboard';

        // ← Default import használata
        this.jwksClient = jwksClient({
            jwksUri: `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/certs`,
            cache: true,
            cacheMaxAge: 86400000,
            rateLimit: true,
            jwksRequestsPerMinute: 10,
        });

        this.logger.log(`Keycloak service initialized for realm: ${this.realm}`);
    }

    async getPublicKey(kid: string): Promise<string> {
        try {
            const key = await this.jwksClient.getSigningKey(kid);
            return key.getPublicKey();
        } catch (error) {
            this.logger.error(`Failed to get public key for kid: ${kid}`, error);
            throw new Error('Failed to retrieve JWT signing key');
        }
    }

    async getUserInfo(accessToken: string): Promise<KeycloakUser> {
        try {
            const response = await fetch(
                `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`Keycloak userinfo request failed: ${response.status}`);
            }

            const userInfo = await response.json();
            this.logger.debug(`User info retrieved for: ${userInfo.email}`);

            return userInfo;
        } catch (error) {
            this.logger.error('Failed to get user info from Keycloak:', error);
            throw new Error('Failed to retrieve user information');
        }
    }

    extractRoles(tokenPayload: any): string[] {
        const roles: string[] = [];

        if (tokenPayload.realm_access?.roles) {
            roles.push(...tokenPayload.realm_access.roles);
        }

        const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID');
        if (clientId && tokenPayload.resource_access?.[clientId]?.roles) {
            roles.push(...tokenPayload.resource_access[clientId].roles);
        }

        return roles.filter(role => ['admin', 'member'].includes(role));
    }

    extractUserData(payload: any): {
        keycloakId: string;
        email: string;
        firstName: string;
        lastName: string;
        roles: string[];
    } {
        return {
            keycloakId: payload.sub,
            email: payload.email,
            firstName: payload.given_name || '',
            lastName: payload.family_name || '',
            roles: this.extractRoles(payload),
        };
    }

    hasRole(roles: string[], requiredRole: string): boolean {
        return roles.includes(requiredRole);
    }

    isAdmin(roles: string[]): boolean {
        return this.hasRole(roles, 'admin');
    }

    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(
                `${this.keycloakUrl}/realms/${this.realm}/.well-known/openid-configuration`,
            );
            return response.ok;
        } catch (error) {
            this.logger.error('Keycloak health check failed:', error);
            return false;
        }
    }
}