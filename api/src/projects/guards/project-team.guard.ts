import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProjectTeamGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user as any;
    const projectId: string | undefined = req.params?.projectId || req.body?.projectId;

    if (!user) throw new ForbiddenException('User not authenticated');
    if (!projectId) throw new ForbiddenException('projectId is required');

    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new ForbiddenException('Project not found');

    const membership = await this.prisma.teamMember.findFirst({
      where: { teamId: project.teamId, userId: user.id },
    });

    if (!membership) throw new ForbiddenException('Not a member of the project team');

    return true;
  }
}
