
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';
import { Unprotected } from 'nest-keycloak-connect';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly prisma: PrismaService, // ← Prisma inject
    ) {}

    @Unprotected()
    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Unprotected()
    @Get('health')
    async getHealth() {
        const dbHealthy = await this.prisma.healthCheck();
        const dbStats = dbHealthy ? await this.prisma.getStats() : null;

        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: {
                connected: dbHealthy,
                stats: dbStats,
            },
        };
    }

    @Get('db/test')
    async testDatabase() {
        try {
            // Test repository pattern
            const stats = await this.prisma.getStats();

            return {
                message: 'Database test successful! 🎉',
                stats,
                prismaVersion: '5.6.0',
                tablesExist: true,
            };
        } catch (error) {
            return {
                message: 'Database test failed! ❌',
                error: error.message,
            };
        }
    }
}