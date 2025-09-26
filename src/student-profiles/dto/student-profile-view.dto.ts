import { ApiProperty } from '@nestjs/swagger';
import { Department } from '../../common/enums';

// DTO classes for StudentProfile Page
export class StudentProfileDTO {
  @ApiProperty({ example: 1, description: 'User ID' })
  user_id: number;

  @ApiProperty({ example: 12345, description: 'Student ID number' })
  student_id: number;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  full_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  email: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    example: '2000-01-15',
    description: 'Date of birth',
    required: false,
  })
  dob?: string;

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
    example: 2023,
    description: 'Enrollment year',
    required: false,
  })
  enrollment_year?: number;
}
