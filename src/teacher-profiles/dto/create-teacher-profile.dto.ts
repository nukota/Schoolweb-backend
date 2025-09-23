import {
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Department } from 'src/common/enums';

export class CreateTeacherProfileDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  teacher_id: number;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsEnum(Department)
  department: Department;

  @IsOptional()
  @IsDateString()
  hire_date?: string;
}
