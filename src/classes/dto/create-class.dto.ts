import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ClassStatus } from '../../common/enums';

export class CreateClassDto {
  @IsString()
  class_code: string;

  @IsNumber()
  subject_id: number;

  @IsNumber()
  teacher_id: number;

  @IsString()
  semester: string;

  @IsNumber()
  max_size: number;

  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  day?: string;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;
}
