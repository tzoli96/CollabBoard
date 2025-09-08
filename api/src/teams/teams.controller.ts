import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto, UpdateTeamDto, AddMemberDto, UpdateMemberRoleDto } from './dto/team.dtos';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from 'nest-keycloak-connect';
import { ROLES } from '../auth/roles';
import { TeamMembershipGuard } from './guards/team-membership.guard';
import { TeamRoleGuard } from './guards/team-role.guard';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teams: TeamsService) {}

  @Get()
  list() {
    return this.teams.list();
  }

  @Get(':teamId')
  @UseGuards(TeamMembershipGuard)
  get(@Param('teamId') teamId: string) {
    return this.teams.getById(teamId);
  }

  @Post()
  @Roles({ roles: [ROLES.REALM_ADMIN, ROLES.REALM_TEAM_LEAD] })
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

  @Patch(':teamId/members/:userId')
  @UseGuards(TeamRoleGuard)
  updateMember(@CurrentUser('id') userId: string, @Param('teamId') teamId: string, @Param('userId') memberId: string, @Body() dto: UpdateMemberRoleDto) {
    return this.teams.updateMemberRole(userId, teamId, memberId, dto);
  }

  @Delete(':teamId/members/:userId')
  @UseGuards(TeamRoleGuard)
  removeMember(@CurrentUser('id') userId: string, @Param('teamId') teamId: string, @Param('userId') memberId: string) {
    return this.teams.removeMember(userId, teamId, memberId);
  }
}
