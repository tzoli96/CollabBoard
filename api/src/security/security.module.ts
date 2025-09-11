import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
    KeycloakConnectModule,
    PolicyEnforcementMode,
    TokenValidation,
} from 'nest-keycloak-connect';

async function fetchRealmPublicKey(issuerUrl: string): Promise<string | undefined> {
    try {
        const res = await fetch(issuerUrl, { method: 'GET' });
        if (!res.ok) {
            console.warn(`[Keycloak] Failed to fetch issuer JSON from ${issuerUrl}: ${res.status} ${res.statusText}`);
            return undefined;
        }
        const json: any = await res.json();
        if (json && typeof json.public_key === 'string' && json.public_key.length > 0) {
            return json.public_key as string;
        }
        console.warn('[Keycloak] Issuer JSON did not contain public_key field.');
        return undefined;
    } catch (err) {
        console.warn('[Keycloak] Error fetching issuer JSON:', err);
        return undefined;
    }
}

@Module({
    imports: [
        ConfigModule,
        KeycloakConnectModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => {
                const authServerUrl = config.get<string>('KEYCLOAK_URL')!; // base KC URL (no /realms)
                const realm = config.get<string>('KEYCLOAK_REALM')!;

                // Preferred: load public key dynamically from issuer JSON
                const issuer =  `${authServerUrl.replace(/\/$/, '')}/realms/${realm}`;
                let realmPublicKey = await fetchRealmPublicKey(issuer);

                console.log(realmPublicKey)
                const keycloakConfig = {
                    authServerUrl: 'http://localhost:8080',
                    realm: config.get<string>('KEYCLOAK_REALM')!,
                    clientId: config.get<string>('KEYCLOAK_CLIENT_ID')!,
                    secret: '',
                    bearerOnly: true,
                    policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
                    tokenValidation: TokenValidation.OFFLINE,
                    realmPublicKey: realmPublicKey ?? undefined,
                };


                return keycloakConfig;
            },
            inject: [ConfigService],
        }),
    ],
    exports: [KeycloakConnectModule],
})
export class SecurityModule {}