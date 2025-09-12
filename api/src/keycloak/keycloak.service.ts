
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
    private readonly keycloakUrl: string;
    private readonly realm: string;

    constructor(private configService: ConfigService) {
        this.keycloakUrl = this.configService.get<string>('KEYCLOAK_URL') || 'http://keycloak:8080';
        this.realm = this.configService.get<string>('KEYCLOAK_REALM') || 'team-dashboard';
        this.logger.log(`Keycloak service initialized for realm: ${this.realm}`);
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

        return roles.filter(role => ['admin', 'member', 'team-lead'].includes(role));
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

    /**
     * Admin token lekérése service account-tal - role assignment-hez
     */
    private async getAdminToken(): Promise<string | null> {
        try {
            const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID');
            const clientSecret = this.configService.get<string>('KEYCLOAK_CLIENT_SECRET');
            
            if (!clientId || !clientSecret) {
                this.logger.warn('Missing Keycloak client credentials for admin operations');
                return null;
            }

            const response = await fetch(
                `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        grant_type: 'client_credentials',
                        client_id: clientId,
                        client_secret: clientSecret,
                    }),
                }
            );

            if (!response.ok) {
                this.logger.error(`Failed to get admin token: ${response.status}`);
                return null;
            }

            const tokenData = await response.json();
            return tokenData.access_token;
        } catch (error) {
            this.logger.error('Error getting admin token:', error);
            return null;
        }
    }

    /**
     * Assign role to user in Keycloak
     */
    async assignRoleToUser(keycloakId: string, roleName: string): Promise<boolean> {
        try {
            const adminToken = await this.getAdminToken();
            if (!adminToken) {
                this.logger.warn(`No admin token available for role assignment`);
                return false;
            }

            // First get the role ID
            const roleResponse = await fetch(
                `${this.keycloakUrl}/admin/realms/${this.realm}/roles/${roleName}`,
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!roleResponse.ok) {
                this.logger.warn(`Failed to fetch role ${roleName}: ${roleResponse.status}`);
                return false;
            }

            const role = await roleResponse.json();

            // Assign the role to the user
            const assignResponse = await fetch(
                `${this.keycloakUrl}/admin/realms/${this.realm}/users/${keycloakId}/role-mappings/realm`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify([{
                        id: role.id,
                        name: role.name
                    }])
                }
            );

            if (!assignResponse.ok) {
                this.logger.warn(`Failed to assign role ${roleName} to user ${keycloakId}: ${assignResponse.status}`);
                return false;
            }

            this.logger.log(`Successfully assigned role ${roleName} to user ${keycloakId}`);
            return true;
        } catch (error) {
            this.logger.error(`Error assigning role ${roleName} to user ${keycloakId}:`, error);
            return false;
        }
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