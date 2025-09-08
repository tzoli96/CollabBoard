import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class TeamRoleGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user as any;
    const teamId: string | undefined = req.params?.teamId || req.body?.teamId;

    if (!user) throw new ForbiddenException('User not authenticated');
    if (!teamId) throw new ForbiddenException('teamId is required');

    // realm admin or team-lead bypass
    if (user.roles?.includes('admin') || user.roles?.includes('team-lead')) return true;

    const membership = await this.prisma.teamMember.findFirst({
      where: { teamId, userId: user.id },
    });

    if (!membership) throw new ForbiddenException('Not a member of this team');

    if (membership.role === Role.ADMIN) return true;

    throw new ForbiddenException('Insufficient team role');
  }
}
