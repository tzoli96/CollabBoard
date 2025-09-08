import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export abstract class BaseRepository {
    protected readonly logger: Logger;

    constructor(
        protected readonly prisma: PrismaService,
        loggerContext: string,
    ) {
        this.logger = new Logger(loggerContext);
    }

    /**
     * Handle Prisma errors and convert to meaningful messages
     */
    protected handleError(error: any, operation: string): never {
        this.logger.error(`${operation} failed:`, error);

        // Prisma specific error codes
        switch (error.code) {
            case 'P2002':
                throw new Error(`Unique constraint violation: ${error.meta?.target || 'unknown field'}`);
            case 'P2025':
                throw new Error('Record not found');
            case 'P2003':
                throw new Error('Foreign key constraint failed');
            default:
                if (error.message) {
                    throw new Error(`Database error: ${error.message}`);
                }
                throw new Error(`Unknown database error during ${operation}`);
        }
    }

    /**
     * Safe pagination helper
     */
    protected validatePagination(page?: number, limit?: number) {
        const validPage = Math.max(1, page || 1);
        const validLimit = Math.min(100, Math.max(1, limit || 10));
        const skip = (validPage - 1) * validLimit;

        return {
            page: validPage,
            limit: validLimit,
            skip,
            take: validLimit,
        };
    }

    /**
     * Build pagination response
     */
    protected buildPaginationResponse<T>(
        data: T[],
        total: number,
        page: number,
        limit: number,
    ) {
        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext,
                hasPrev,
            },
        };
    }
}