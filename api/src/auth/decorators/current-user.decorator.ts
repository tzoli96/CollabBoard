
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
    (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext): AuthenticatedUser | any => {
        const request = ctx.switchToHttp().getRequest();
        const user: AuthenticatedUser = request.user;

        return data ? user?.[data] : user;
    },
);