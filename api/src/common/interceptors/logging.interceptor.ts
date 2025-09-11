import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();

        const { method, url, headers, body, query } = req;
        const userAgent = headers['user-agent'] || 'Unknown';
        const authorization = headers['authorization'] ? 'Bearer ***' : 'None';

        this.logger.log(`📨 Incoming Request: ${method} ${url}`);
        this.logger.debug(`🔍 Headers: Authorization: ${authorization}, User-Agent: ${userAgent}`);
        this.logger.debug(`🔍 Query: ${JSON.stringify(query)}`);
        this.logger.debug(`🔍 Body: ${JSON.stringify(body)}`);

        if (req.user) {
            this.logger.debug(`👤 User: ${req.user.email || req.user.keycloakId || 'Unknown'}`);
            this.logger.debug(`🎭 Roles: ${JSON.stringify(req.user.roles || [])}`);
        }

        const now = Date.now();
        return next.handle().pipe(
            tap({
                next: (responseBody) => {
                    const statusCode = res.statusCode;
                    const responseTime = Date.now() - now;

                    this.logger.log(`📤 Response: ${method} ${url} ${statusCode} - ${responseTime}ms`);

                    if (process.env.LOG_LEVEL === 'verbose' && responseBody) {
                        this.logger.verbose(`📋 Response Body: ${JSON.stringify(responseBody)}`);
                    }
                },
                error: (error) => {
                    const statusCode = res.statusCode;
                    const responseTime = Date.now() - now;

                    this.logger.error(`❌ Error: ${method} ${url} ${statusCode} - ${responseTime}ms`);
                    this.logger.error(`💥 Error Details: ${error.message}`);
                    this.logger.error(`📚 Stack Trace: ${error.stack}`);
                },
            }),
        );
    }
}