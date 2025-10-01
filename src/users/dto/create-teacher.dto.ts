import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Department } from '../../common/enums';

export class CreateTeacherDTO {
  @ApiProperty({
    example: 'Dr. John Smith',
    description: 'Full name of the teacher',
  })
  @IsString()
  full_name: string;

  @ApiProperty({
    example: 'john.smith@example.com',
    description: 'Teacher email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Teacher password',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'T001',
    description: 'Teacher ID number',
  })
  @IsString()
  teacher_id: string;

  @ApiProperty({
    example: '1980-01-15',
    description: 'Date of birth in YYYY-MM-DD format',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiProperty({
    example: 'Associate Professor',
    description: 'Academic position',
    required: false,
  })
  @IsOptional()
  @IsString()
  position?: string;

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
    example: '2020-08-15',
    description: 'Date of hiring in YYYY-MM-DD format',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  hire_date?: string;
}
