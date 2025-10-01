import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDTO {
  @ApiProperty({
    example: 'CS101.A01',
    description: 'Unique class code',
  })
  @IsString()
  @Matches(/^[A-Z]{2}\d{3}\.[A-Z]\d{2}$/, {
    message:
      'Class code must be in format: 2 uppercase letters, 3 numbers, dot, 1 uppercase letter, 2 numbers (e.g., CS101.A01)',
  })
  class_code: string;

  @ApiProperty({
    example: 1,
    description: 'Subject ID reference',
  })
  @IsNumber()
  subject_id: number;

  @ApiProperty({
    example: 1,
    description: 'Teacher ID reference',
  })
  @IsNumber()
  teacher_id: number;

  @ApiProperty({
    example: 'Fall 2024',
    description: 'Semester name',
  })
  @IsString()
  semester: string;

  @ApiProperty({
    example: 30,
    description: 'Maximum number of students',
  })
  @IsNumber()
  max_size: number;

  @ApiProperty({
    example: 'A101',
    description: 'Classroom location',
    required: false,
  })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Class start date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({
    example: '2024-05-15',
    description: 'Class end date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({
    example: 'Monday',
    description: 'Day of the week',
    required: false,
  })
  @IsOptional()
  @IsString()
  day?: string;

  @ApiProperty({
    example: '10:00 AM',
    description: 'Class start time',
    required: false,
  })
  @IsOptional()
  @IsString()
  start_time?: string;

  @ApiProperty({
    example: '11:30 AM',
    description: 'Class end time',
    required: false,
  })
  @IsOptional()
  @IsString()
  end_time?: string;
}
