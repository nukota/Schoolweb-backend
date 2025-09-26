import { ApiProperty } from '@nestjs/swagger';
import { Department } from '../../common/enums';

//DTO classes for Teacher Profile Page
export class TeacherProfileDTO {
  @ApiProperty({ example: 1, description: 'User ID' })
  user_id: number;

  @ApiProperty({ example: 54321, description: 'Teacher ID number' })
  teacher_id: number;

  @ApiProperty({ example: 'Dr. Jane Smith', description: 'Full name' })
  full_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  email: string;

  @ApiProperty({
    example: 'Associate Professor',
    description: 'Academic position',
    required: false,
  })
  position?: string;

  @ApiProperty({
    example: '1980-01-15',
    description: 'Date of birth',
    required: false,
  })
  dob?: string; // ISO date string

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  avatar_url?: string;

  @ApiProperty({
    enum: Department,
    example: Department.COMPUTER_SCIENCE,
    description: 'Department',
  })
  department: Department;

  @ApiProperty({
    example: '2020-08-15',
    description: 'Hire date',
    required: false,
  })
  hire_date?: string;
}
