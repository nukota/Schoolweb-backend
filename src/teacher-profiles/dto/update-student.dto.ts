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

export class UpdateStudentDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the student',
    required: false,
  })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Student email address',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'New password for the student',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    example: 12345,
    description: 'Student ID number',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  student_id?: number;

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
    required: false,
  })
  @IsOptional()
  @IsEnum(Department)
  department?: Department;

  @ApiProperty({
    example: 2023,
    description: 'Year of enrollment',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  enrollment_year?: number;
}
