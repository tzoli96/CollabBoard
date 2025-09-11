import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
    KeycloakConnectModule,
    PolicyEnforcementMode,
    TokenValidation,
} from 'nest-keycloak-connect';

@Module({
    imports: [
        ConfigModule,
        KeycloakConnectModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => {
                const keycloakConfig = {
                    authServerUrl: config.get<string>('KEYCLOAK_URL')!,
                    realm: config.get<string>('KEYCLOAK_REALM')!,
                    clientId: config.get<string>('KEYCLOAK_CLIENT_ID')!,
                    secret: '',
                    bearerOnly: true,
                    policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
                    tokenValidation: TokenValidation.OFFLINE,
                    // Debug beállítások
                    logLevel: 'DEBUG', // TRACE, DEBUG, INFO, WARN, ERROR
                };

                console.log('🔧 Keycloak Configuration:', {
                    authServerUrl: keycloakConfig.authServerUrl,
                    realm: keycloakConfig.realm,
                    clientId: keycloakConfig.clientId,
                    bearerOnly: keycloakConfig.bearerOnly,
                    tokenValidation: keycloakConfig.tokenValidation,
                });

                return keycloakConfig;
            },
            inject: [ConfigService],
        }),
    ],
    exports: [KeycloakConnectModule],
})
export class SecurityModule {}