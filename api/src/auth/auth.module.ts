
import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { KeycloakService } from '../keycloak/keycloak.service';

@Module({
    imports: [],
    controllers: [AuthController],
    providers: [
        AuthService,
        KeycloakService,
    ],
    exports: [
        AuthService,
        KeycloakService,
    ],
})
export class AuthModule {}