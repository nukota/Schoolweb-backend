import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Department } from '../../common/enums';

export class CreateSubjectDto {
  @IsString()
  subject_name: string;

  @IsString()
  subject_code: string;

  @IsEnum(Department)
  department: Department;

  @IsNumber()
  credits: number;

  @IsOptional()
  @IsString()
  description?: string;
}
