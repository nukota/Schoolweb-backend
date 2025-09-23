import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  IsEmail,
  MinLength,
} from 'class-validator';
import { Department } from '../../common/enums';
import { BaseResponseDTO } from '../../common/dto/common.dto';

export class CreateStudentProfileDto {
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

  @IsOptional()
  @IsNumber()
  enrollment_year?: number;
}

export class CreateTeacherProfileDto {
  @IsNumber()
  teacher_id: number;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsEnum(Department)
  department: Department;

  @IsOptional()
  @IsDateString()
  hire_date?: string;
}

export class ProfileCreatedResponseDto extends BaseResponseDTO {
  profile?: {
    user_id: number;
    student_id?: number;
    teacher_id?: number;
    department: Department;
  };
}
