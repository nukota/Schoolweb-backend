import { IsNumber, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '../../common/enums';

export class CreateEnrollmentDto {
  @ApiProperty({
    example: 1,
    description: 'Student ID reference',
  })
  @IsNumber()
  student_id: number;

  @ApiProperty({
    example: 1,
    description: 'Class ID reference',
  })
  @IsNumber()
  class_id: number;

  @ApiProperty({
    enum: EnrollmentStatus,
    example: EnrollmentStatus.ENROLLED,
    description: 'Enrollment status',
    required: false,
  })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @ApiProperty({
    example: [8.5, 9.0, 7.5, 8.0],
    description: 'Array of scores for the student',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  scores?: number[];
}
