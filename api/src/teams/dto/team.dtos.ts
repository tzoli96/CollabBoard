import { IsString, IsOptional, IsNotEmpty, IsIn } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;
  @IsIn(['admin', 'team-lead', 'member'])
  @IsOptional()
  role?: Role;
}
