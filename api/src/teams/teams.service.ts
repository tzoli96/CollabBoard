import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTeamDto, UpdateTeamDto, AddMemberDto, UpdateMemberRoleDto } from './dto/team.dtos';
import { Activity } from '@prisma/client';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.team.findMany({ orderBy: { createdAt: 'desc' } });
  }

  getById(teamId: string) {
    return this.prisma.team.findUnique({ where: { id: teamId }, include: { members: { include: { user: true } }, projects: true } });
  }

  async create(userId: string, dto: CreateTeamDto) {
    const team = await this.prisma.team.create({
      data: { name: dto.name, description: dto.description, createdBy: userId },
    });
    await this.prisma.teamMember.create({ data: { teamId: team.id, userId, role: 'ADMIN' } });
    await this.logActivity(userId, 'TEAM_CREATED', { teamId: team.id, name: team.name });
    return team;
  }

  async update(userId: string, teamId: string, dto: UpdateTeamDto) {
    const team = await this.prisma.team.update({ where: { id: teamId }, data: dto });
    await this.logActivity(userId, 'TEAM_UPDATED', { teamId });
    return team;
  }

  async remove(userId: string, teamId: string) {
    await this.prisma.team.delete({ where: { id: teamId } });
    await this.logActivity(userId, 'TEAM_DELETED', { teamId });
    return { ok: true };
  }

  listMembers(teamId: string) {
    return this.prisma.teamMember.findMany({ where: { teamId }, include: { user: true } });
  }

  async addMember(actorUserId: string, teamId: string, dto: AddMemberDto) {
    const member = await this.prisma.teamMember.create({
      data: { teamId, userId: dto.userId, role: dto.role ?? 'MEMBER' },
    });
    await this.logActivity(actorUserId, 'TEAM_MEMBER_ADDED', { teamId, userId: dto.userId, role: dto.role ?? 'MEMBER' });
    return member;
  }

  async updateMemberRole(actorUserId: string, teamId: string, userId: string, dto: UpdateMemberRoleDto) {
    const member = await this.prisma.teamMember.update({
      where: { userId_teamId: { userId, teamId } },
      data: { role: dto.role },
    });
    await this.logActivity(actorUserId, 'TEAM_MEMBER_ROLE_UPDATED', { teamId, userId, role: dto.role });
    return member;
  }

  async removeMember(actorUserId: string, teamId: string, userId: string) {
    await this.prisma.teamMember.delete({ where: { userId_teamId: { userId, teamId } } });
    await this.logActivity(actorUserId, 'TEAM_MEMBER_REMOVED', { teamId, userId });
    return { ok: true };
  }

  private logActivity(actorUserId: string, type: string, payload?: any) {
    return this.prisma.activity.create({ data: { actorUserId, type, payload } as any });
  }
}
