import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, AddMemberDto } from './dto/team.dtos';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from 'nest-keycloak-connect';
import { KEYCLOAK_ROLES } from '../auth/roles';
import { TeamMembershipGuard } from './guards/team-membership.guard';
import { TeamRoleGuard } from './guards/team-role.guard';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teams: TeamsService) {}

  @Get()
  @Roles({ roles: [KEYCLOAK_ROLES.REALM_ADMIN, KEYCLOAK_ROLES.REALM_MEMBER, KEYCLOAK_ROLES.REALM_TEAM_LEAD] })
  list() {
    return this.teams.list();
  }

  @Get(':teamId')
  @UseGuards(TeamMembershipGuard)
  get(@Param('teamId') teamId: string) {
    return this.teams.getById(teamId);
  }

  @Post()
  @Roles({ roles: [KEYCLOAK_ROLES.REALM_ADMIN, KEYCLOAK_ROLES.REALM_TEAM_LEAD] })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTeamDto) {
    return this.teams.create(userId, dto);
  }

  @Patch(':teamId')
  @UseGuards(TeamRoleGuard)
  update(@CurrentUser('id') userId: string, @Param('teamId') teamId: string, @Body() dto: UpdateTeamDto) {
    return this.teams.update(userId, teamId, dto);
  }

  @Delete(':teamId')
  @UseGuards(TeamRoleGuard)
  remove(@CurrentUser('id') userId: string, @Param('teamId') teamId: string) {
    return this.teams.remove(userId, teamId);
  }

  @Get(':teamId/members')
  @UseGuards(TeamMembershipGuard)
  listMembers(@Param('teamId') teamId: string) {
    return this.teams.listMembers(teamId);
  }

  @Post(':teamId/members')
  @UseGuards(TeamRoleGuard)
  addMember(@CurrentUser('id') userId: string, @Param('teamId') teamId: string, @Body() dto: AddMemberDto) {
    return this.teams.addMember(userId, teamId, dto);
  }


  @Delete(':teamId/members/:userId')
  @UseGuards(TeamRoleGuard)
  removeMember(@CurrentUser('id') userId: string, @Param('teamId') teamId: string, @Param('userId') memberId: string) {
    return this.teams.removeMember(userId, teamId, memberId);
  }

  @Get(':teamId/available-users')
  @UseGuards(TeamMembershipGuard)
  getAvailableUsers(@Param('teamId') teamId: string) {
    return this.teams.getAvailableUsers(teamId);
  }
}
