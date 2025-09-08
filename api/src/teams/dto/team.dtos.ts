import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
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

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

export class UpdateMemberRoleDto {
  @IsEnum(Role)
  role!: Role;
}
