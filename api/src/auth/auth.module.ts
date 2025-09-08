
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { KeycloakService } from '../keycloak/keycloak.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                // We don't need to sign tokens, only verify them
                // Keycloak handles token signing
                verifyOptions: {
                    algorithms: ['RS256'],
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        KeycloakService,
        JwtAuthGuard,
        RolesGuard,
    ],
    exports: [
        AuthService,
        JwtAuthGuard,
        RolesGuard,
        PassportModule,
    ],
})
export class AuthModule {}