import {
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Department } from 'src/common/enums';

export class CreateStudentDTO {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the student',
  })
  @IsString()
  full_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Student email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Student password',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'A12345',
    description: 'Student ID number',
  })
  @IsString()
  student_id: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: '2000-01-15',
    description: 'Date of birth in YYYY-MM-DD format',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar image URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiProperty({
    enum: Department,
    example: Department.COMPUTER_SCIENCE,
    description: 'Academic department',
  })
  @IsEnum(Department)
  department: Department;

  @ApiProperty({
    example: 2023,
    description: 'Year of enrollment',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  enrollment_year?: number;
}
