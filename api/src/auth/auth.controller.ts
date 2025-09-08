
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from 'nest-keycloak-connect';
import { Public } from './decorators/public.decorator';
import { Unprotected } from 'nest-keycloak-connect';
import { ROLES } from './roles';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * Public endpoint - no authentication required
     */
    @Public()
    @Unprotected()
    @Get('health')
    async getAuthHealth() {
        const health = await this.authService.healthCheck();

        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            auth: health,
        };
    }

    /**
     * Get current user info - requires authentication
     */
    @Get('me')
    async getCurrentUser(@CurrentUser() user: any) {
        return {
            message: 'User authenticated successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles,
                isAdmin: user.roles.includes('admin'),
            },
        };
    }

    /**
     * Get full user profile with teams - requires authentication
     */
    @Get('profile')
    async getUserProfile(@CurrentUser() user: any) {
        const profile = await this.authService.getUserProfile(user);

        return {
            message: 'User profile retrieved successfully',
            profile,
        };
    }

    /**
     * Admin only endpoint - test role-based access
     */
    @Roles({ roles: [ROLES.REALM_ADMIN] })
    @Get('admin')
    async getAdminInfo(@CurrentUser() user: any) {
        return {
            message: 'Admin access granted',
            user: {
                email: user.email,
                roles: user.roles,
            },
            adminFeatures: [
                'Manage teams',
                'Manage projects',
                'Manage users',
                'View all data',
            ],
        };
    }

    /**
     * Test endpoint for any authenticated user
     */
    @Post('test')
    async testAuthentication(@CurrentUser() user: any) {
        return {
            message: 'Authentication test successful',
            timestamp: new Date().toISOString(),
            user: {
                id: user.id,
                email: user.email,
                roles: user.roles,
            },
        };
    }
}