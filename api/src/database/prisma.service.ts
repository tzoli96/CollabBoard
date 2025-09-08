import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        super({
            log: ['query', 'info', 'warn', 'error'],
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ Connected to database successfully');
        } catch (error) {
            this.logger.error('❌ Failed to connect to database:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        try {
            await this.$disconnect();
            this.logger.log('💤 Disconnected from database');
        } catch (error) {
            this.logger.error('❌ Error disconnecting from database:', error);
        }
    }

    /**
     * Health check - verify database connection
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.$queryRaw`SELECT 1`;
            return true;
        } catch (error) {
            this.logger.error('Database health check failed:', error);
            return false;
        }
    }

    /**
     * Get database statistics
     */
    async getStats() {
        try {
            const [userCount, teamCount, projectCount] = await Promise.all([
                this.user.count(),
                this.team.count(),
                this.project.count(),
            ]);

            return {
                users: userCount,
                teams: teamCount,
                projects: projectCount,
                timestamp: new Date(),
            };
        } catch (error) {
            this.logger.error('Failed to get database stats:', error);
            throw error;
        }
    }
}