import { PartialType } from '@nestjs/swagger';
import { CreateTeacherProfileDto } from './create-teacher-profile.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateTeacherProfileDto extends PartialType(
  CreateTeacherProfileDto,
) {
  @ApiProperty({ example: 'teacher@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Dr. John Smith', required: false })
  @IsOptional()
  @IsString()
  full_name?: string;
}
