import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TeamMembershipGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user as any;
    const teamId: string | undefined = req.params?.teamId || req.body?.teamId;

    if (!user) throw new ForbiddenException('User not authenticated');
    if (!teamId) throw new ForbiddenException('teamId is required');

    const membership = await this.prisma.teamMember.findFirst({
      where: { teamId, userId: user.id },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this team');
    }

    return true;
  }
}
