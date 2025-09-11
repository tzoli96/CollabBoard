
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { SecurityModule } from './security/security.module';
import { AuthGuard, RoleGuard } from 'nest-keycloak-connect';
import { SyncUserInterceptor } from './auth/interceptors/sync-user.interceptor';
import { TeamsModule } from './teams/teams.module';
import { ProjectsModule } from './projects/projects.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        DatabaseModule,
        SecurityModule,
        AuthModule,
        TeamsModule,
        ProjectsModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_GUARD, useClass: RoleGuard },
        { provide: APP_INTERCEPTOR, useClass: SyncUserInterceptor },
        { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    ],
})
export class AppModule {}