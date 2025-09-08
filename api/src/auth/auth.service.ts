
import { Injectable, Logger } from '@nestjs/common';
import { KeycloakService } from '../keycloak/keycloak.service';
import { UsersRepository } from '../database/repositories/users.repository';
import { AuthenticatedUser } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private keycloakService: KeycloakService,
        private usersRepository: UsersRepository,
    ) {}

    /**
     * Get user profile with teams and projects
     */
    async getUserProfile(user: AuthenticatedUser) {
        try {
            const userWithTeams = await this.usersRepository.findWithTeams(user.id);

            return {
                id: user.id,
                keycloakId: user.keycloakId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName} ${user.lastName}`,
                roles: user.roles,
                isAdmin: this.keycloakService.isAdmin(user.roles),
                teams: userWithTeams?.teamMemberships || [],
                isActive: user.isActive,
            };
        } catch (error) {
            this.logger.error(`Failed to get user profile for ${user.email}:`, error);
            throw error;
        }
    }

    /**
     * Health check for auth services
     */
    async healthCheck() {
        const keycloakHealthy = await this.keycloakService.healthCheck();

        return {
            keycloak: keycloakHealthy,
            database: true, // Will be checked by database health check
        };
    }
}