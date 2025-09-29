import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class AddStudentsToClassDTO {
  @ApiProperty({
    description: 'Array of student IDs to add to the class',
    type: [String],
    example: ['1', '2', '3'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  student_ids: string[];
}

export class RemoveStudentsFromClassDTO {
  @ApiProperty({
    description: 'Array of student IDs to remove from the class',
    type: [String],
    example: ['1', '2'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  student_ids: string[];
}

export class StudentScoreUpdateDTO {
  @ApiProperty({
    description: 'Student user ID',
    type: String,
    example: '1',
  })
  @IsString()
  @IsNotEmpty()
  student_id: string;

  @ApiProperty({
    description: 'Coursework score (0-10)',
    type: Number,
    example: 8.5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Coursework score must be a number' })
  @Min(0, { message: 'Coursework score must be at least 0' })
  @Max(10, { message: 'Coursework score must be at most 10' })
  coursework?: number;

  @ApiProperty({
    description: 'Lab score (0-10)',
    type: Number,
    example: 9.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Lab score must be a number' })
  @Min(0, { message: 'Lab score must be at least 0' })
  @Max(10, { message: 'Lab score must be at most 10' })
  lab?: number;

  @ApiProperty({
    description: 'Midterm score (0-10)',
    type: Number,
    example: 7.5,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Midterm score must be a number' })
  @Min(0, { message: 'Midterm score must be at least 0' })
  @Max(10, { message: 'Midterm score must be at most 10' })
  midterm?: number;

  @ApiProperty({
    description: 'Final exam score (0-10)',
    type: Number,
    example: 8.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Final exam score must be a number' })
  @Min(0, { message: 'Final exam score must be at least 0' })
  @Max(10, { message: 'Final exam score must be at most 10' })
  final_exam?: number;
}

export class EditStudentScoresDTO {
  @ApiProperty({
    description: 'Array of student score updates',
    type: [StudentScoreUpdateDTO],
  })
  @IsArray()
  student_scores: StudentScoreUpdateDTO[];
}

export class ClassManagementResponseDTO {
  @ApiProperty({
    description: 'Success message',
    example: 'Students added successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Number of students affected',
    example: 3,
  })
  affected_count: number;

  @ApiProperty({
    description: 'Details about the operation',
    example: [
      'Student John Doe added',
      'Enrollment request for Jane Smith approved',
    ],
    required: false,
  })
  details?: string[];
}
