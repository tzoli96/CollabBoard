import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dtos';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  list(teamId?: string) {
    return this.prisma.project.findMany({ where: { teamId: teamId || undefined }, orderBy: { createdAt: 'desc' } });
  }

  getById(projectId: string) {
    return this.prisma.project.findUnique({ where: { id: projectId }, include: { team: true } });
  }

  async create(userId: string, dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        title: dto.title,
        description: dto.description,
        teamId: dto.teamId,
        createdBy: userId,
      },
    });
    await this.prisma.activity.create({ data: { actorUserId: userId, type: 'PROJECT_CREATED', teamId: dto.teamId, projectId: project.id, payload: { title: dto.title } } });
    return project;
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.update({ where: { id: projectId }, data: dto });
    await this.prisma.activity.create({ data: { actorUserId: userId, type: 'PROJECT_UPDATED', teamId: project.teamId, projectId } });
    return project;
  }

  async remove(userId: string, projectId: string) {
    const project = await this.prisma.project.delete({ where: { id: projectId } });
    await this.prisma.activity.create({ data: { actorUserId: userId, type: 'PROJECT_DELETED', teamId: project.teamId, projectId } });
    return { ok: true };
  }
}
