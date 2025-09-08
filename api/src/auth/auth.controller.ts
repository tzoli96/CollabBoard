
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Public } from './decorators/public.decorator';
import type { AuthenticatedUser } from './strategies/jwt.strategy'; // ← import type használata

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * Public endpoint - no authentication required
     */
    @Public()
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
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
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
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getUserProfile(@CurrentUser() user: AuthenticatedUser) {
        const profile = await this.authService.getUserProfile(user);

        return {
            message: 'User profile retrieved successfully',
            profile,
        };
    }

    /**
     * Admin only endpoint - test role-based access
     */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get('admin')
    async getAdminInfo(@CurrentUser() user: AuthenticatedUser) {
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
    @UseGuards(JwtAuthGuard)
    @Post('test')
    async testAuthentication(@CurrentUser() user: AuthenticatedUser) {
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