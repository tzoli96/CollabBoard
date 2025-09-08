import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectTeamGuard } from './guards/project-team.guard';

@Module({
  imports: [DatabaseModule],
  providers: [ProjectsService, ProjectTeamGuard],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
