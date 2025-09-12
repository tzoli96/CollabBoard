import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTeamDto, UpdateTeamDto, AddMemberDto } from './dto/team.dtos';
import { ROLES } from '../auth/roles';
import { KeycloakService } from '../keycloak/keycloak.service';

@Injectable()
export class TeamsService {
  constructor(
      private readonly prisma: PrismaService,
      private readonly keycloakService: KeycloakService
  ) {}

  list() {
      return this.prisma.team.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
              members: {
                  include: {
                      user: true
                  }
              },
              projects: true
          }
      });  }

  getById(teamId: string) {
    return this.prisma.team.findUnique({ where: { id: teamId }, include: { members: { include: { user: true } }, projects: true } });
  }

  async create(userId: string, dto: CreateTeamDto) {
    const team = await this.prisma.team.create({
      data: { name: dto.name, description: dto.description, createdBy: userId },
    });

    await this.prisma.teamMember.create({ data: { teamId: team.id, userId } });
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

  async listMembers(teamId: string) {
    // ✅ Egyszerű DB query - nincs Keycloak API hívás!
    const members = await this.prisma.teamMember.findMany({
        where: { teamId }, 
        include: { 
            user: {
                select: {
                    id: true,
                    keycloakId: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    roles: true, // ✨ Role-ok az adatbázisból
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                }
            }
        } 
    });

    // Role-based logika továbbra is működik
    const membersWithRoles = members.map(member => {
        const userRoles = member.user.roles || ['member'];
        const primaryRole = this.determinePrimaryRole(userRoles);

        return {
            ...member,
            user: {
                ...member.user,
                role: primaryRole,
                isAdmin: userRoles.includes('admin'),
                isTeamLead: userRoles.includes('team-lead'),
                canManageTeam: userRoles.includes('admin') || userRoles.includes('team-lead')
            }
        };
    });

    return { members: membersWithRoles };
  }
    private determinePrimaryRole(roles: string[]): string {
        if (roles.includes('admin')) return 'admin';
        if (roles.includes('team-lead')) return 'team-lead';
        return 'member';
    }
  async addMember(actorUserId: string, teamId: string, dto: AddMemberDto) {
    // Get user data to access keycloakId
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Create team member
    const member = await this.prisma.teamMember.create({
      data: { teamId, userId: dto.userId },
    });

    // Assign role in Keycloak if provided
    if (dto.role) {
      const roleAssigned = await this.keycloakService.assignRoleToUser(
        user.keycloakId, 
        dto.role
      );
      
      if (!roleAssigned) {
        // Log warning but don't fail the member addition
        console.warn(`Failed to assign role ${dto.role} to user ${user.keycloakId} in Keycloak`);
      }
    } else {
      // Assign default 'member' role if no role specified
      await this.keycloakService.assignRoleToUser(user.keycloakId, 'member');
    }

    await this.logActivity(actorUserId, 'TEAM_MEMBER_ADDED', { 
      teamId, 
      userId: dto.userId,
      role: dto.role || 'member'
    });
    
    return member;
  }

  async removeMember(actorUserId: string, teamId: string, userId: string) {
    await this.prisma.teamMember.delete({ where: { userId_teamId: { userId, teamId } } });
    await this.logActivity(actorUserId, 'TEAM_MEMBER_REMOVED', { teamId, userId });
    return { ok: true };
  }

  async getAvailableUsers(teamId: string) {
    return this.prisma.user.findMany({
      where: {
        isActive: true,
        teamMemberships: {
          none: {
            teamId: teamId
          }
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        keycloakId: true,
      },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' }
      ]
    });
  }

  private logActivity(actorUserId: string, type: string, payload?: any) {
    return this.prisma.activity.create({ data: { actorUserId, type, payload } as any });
  }
}
