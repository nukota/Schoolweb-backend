import {
  IsNumber,
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Department } from 'src/common/enums';

export class CreateStudentProfileDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  student_id: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsEnum(Department)
  department: Department;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  enrollment_year?: number;
}
