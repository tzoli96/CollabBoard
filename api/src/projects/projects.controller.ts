import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dtos';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProjectTeamGuard } from './guards/project-team.guard';
import { TeamMembershipGuard } from '../teams/guards/team-membership.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@Query('teamId') teamId?: string) {
    return this.projects.list(teamId);
  }

  @Get(':projectId')
  @UseGuards(ProjectTeamGuard)
  get(@Param('projectId') projectId: string) {
    return this.projects.getById(projectId);
  }

  @Post()
  @UseGuards(TeamMembershipGuard)
  create(@CurrentUser('id') userId: string, @Body() dto: CreateProjectDto) {
    // Membership guard checks dto.teamId membership when provided in body
    return this.projects.create(userId, dto);
  }

  @Patch(':projectId')
  @UseGuards(ProjectTeamGuard)
  update(@CurrentUser('id') userId: string, @Param('projectId') projectId: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(userId, projectId, dto);
  }

  @Delete(':projectId')
  @UseGuards(ProjectTeamGuard)
  remove(@CurrentUser('id') userId: string, @Param('projectId') projectId: string) {
    return this.projects.remove(userId, projectId);
  }
}
