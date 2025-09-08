import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { UsersRepository } from '../../database/repositories/users.repository';
import { KeycloakService } from '../../keycloak/keycloak.service';

@Injectable()
export class SyncUserInterceptor implements NestInterceptor {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly keycloakService: KeycloakService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const tokenPayload = req.user; // nest-keycloak-connect attaches decoded token here

    if (!tokenPayload) {
      return next.handle();
    }

    const data = this.keycloakService.extractUserData(tokenPayload);

    return from(this.usersRepository.syncFromKeycloak({
      keycloakId: data.keycloakId,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    })).pipe(
      switchMap((user) => {
        // Enrich request.user so CurrentUser decorator still works with DB fields
        req.user = {
          id: user.id,
          keycloakId: user.keycloakId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: data.roles,
          isActive: true,
        };
        return next.handle();
      }),
      tap({
        error: (err) => {
          // In case of DB error, we still pass through but without enrichment
          // console.error('User sync failed', err);
        }
      })
    );
  }
}
