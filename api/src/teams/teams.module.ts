import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { DatabaseModule } from '../database/database.module';
import { TeamMembershipGuard } from './guards/team-membership.guard';
import { TeamRoleGuard } from './guards/team-role.guard';

@Module({
  imports: [DatabaseModule],
  providers: [TeamsService, TeamMembershipGuard, TeamRoleGuard],
  controllers: [TeamsController],
  exports: [TeamsService],
})
export class TeamsModule {}
