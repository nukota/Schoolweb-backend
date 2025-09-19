import { IsNumber, IsOptional, IsEnum, IsArray } from 'class-validator';
import { EnrollmentStatus } from '../../common/enums';

export class CreateEnrollmentDto {
  @IsNumber()
  student_id: number;

  @IsNumber()
  class_id: number;

  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  scores?: number[];
}
