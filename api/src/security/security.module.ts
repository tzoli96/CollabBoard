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
      useFactory: (config: ConfigService) => ({
        authServerUrl: config.get<string>('KEYCLOAK_URL')!,
        realm: config.get<string>('KEYCLOAK_REALM')!,
        clientId: config.get<string>('KEYCLOAK_CLIENT_ID')!,
        secret: config.get<string>('KEYCLOAK_CLIENT_SECRET')!,
        bearerOnly: true,
        policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
        tokenValidation: TokenValidation.OFFLINE,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [KeycloakConnectModule],
})
export class SecurityModule {}
