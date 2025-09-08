import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Status } from '@prisma/client';

export class CreateProjectDto {
  @IsString() @IsNotEmpty() title!: string;
  @IsString() @IsOptional() description?: string;
  @IsString() @IsNotEmpty() teamId!: string;
}

export class UpdateProjectDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(Status) @IsOptional() status?: Status;
}
