import { ApiProperty } from '@nestjs/swagger';
import { Department } from '../../common/enums';

// DTO for Students List Page
export class StudentListItemDTO {
  @ApiProperty({ example: 1, description: 'User ID' })
  user_id: number;

  @ApiProperty({ example: 'John Doe', description: 'Student name' })
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Student email' })
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Student phone' })
  phone: string;

  @ApiProperty({ example: 3.75, description: 'Student GPA' })
  gpa: number;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  avatar?: string;

  @ApiProperty({ example: '12345', description: 'Student ID' })
  student_id: string;
}

export class StudentsPageDTO {
  @ApiProperty({
    type: [StudentListItemDTO],
    description: 'List of students',
  })
  students: StudentListItemDTO[];
}

// DTO for Student Details Page
export class StudentDetailsDTO {
  @ApiProperty({ example: 1, description: 'User ID' })
  user_id: number;

  @ApiProperty({ example: 'John Doe', description: 'Student name' })
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Student email' })
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Student phone' })
  phone: string;

  @ApiProperty({ example: 3.75, description: 'Student GPA' })
  gpa: number;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  avatar?: string;

  @ApiProperty({ example: '12345', description: 'Student ID' })
  student_id: string;

  @ApiProperty({ example: 'Computer Science', description: 'Department name' })
  department: string;

  @ApiProperty({ example: 2023, description: 'Enrollment year' })
  enrollment_year: number;

  @ApiProperty({ example: 45, description: 'Total credits earned' })
  total_credits: number;

  @ApiProperty({ example: 6, description: 'Total semesters completed' })
  total_semesters: number;

  @ApiProperty({ example: 15, description: 'Number of completed classes' })
  completed_classes: number;

  @ApiProperty({ example: 18, description: 'Total number of classes taken' })
  total_classes: number;
}

// DTO classes for Profile Page
export class StudentProfileDTO {
  @ApiProperty({ example: 1, description: 'User ID' })
  user_id: number;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  full_name: string;

  @ApiProperty({
    example: '2000-01-15',
    description: 'Date of birth',
    required: false,
  })
  dob?: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  password: string;

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

  @ApiProperty({ example: 12345, description: 'Student ID number' })
  student_id: number;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
    required: false,
  })
  email?: string;

  @ApiProperty({
    example: 2023,
    description: 'Enrollment year',
    required: false,
  })
  enrollment_year?: number;
}

export class UpdateStudentProfileDTO {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name',
    required: false,
  })
  full_name?: string;

  @ApiProperty({
    example: '2000-01-15',
    description: 'Date of birth',
    required: false,
  })
  dob?: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'New password',
    required: false,
  })
  password?: string;

  @ApiProperty({
    example: 'https://example.com/new-avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  avatar_url?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
    required: false,
  })
  email?: string;
}

//DTO for Teacher Profile Page
export class TeacherProfileDTO {
  @ApiProperty({ example: 1, description: 'User ID' })
  user_id: number;

  @ApiProperty({ example: 'Dr. Jane Smith', description: 'Full name' })
  full_name: string;

  @ApiProperty({
    example: '1980-01-15',
    description: 'Date of birth',
    required: false,
  })
  dob?: string; // ISO date string

  @ApiProperty({ example: 'password123', description: 'User password' })
  password: string;

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

  @ApiProperty({ example: 54321, description: 'Teacher ID number' })
  teacher_id: number;

  @ApiProperty({
    example: 'Associate Professor',
    description: 'Academic position',
    required: false,
  })
  position?: string;

  @ApiProperty({
    example: '2020-08-15',
    description: 'Hire date',
    required: false,
  })
  hire_date?: string;
}
export class UpdateTeacherProfileDTO {
  @ApiProperty({
    example: 'Dr. Jane Smith',
    description: 'Full name',
    required: false,
  })
  full_name?: string;

  @ApiProperty({
    example: '1980-01-15',
    description: 'Date of birth',
    required: false,
  })
  dob?: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'New password',
    required: false,
  })
  password?: string;

  @ApiProperty({
    example: 'https://example.com/new-avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  avatar_url?: string;

  @ApiProperty({
    enum: Department,
    example: Department.COMPUTER_SCIENCE,
    description: 'Department',
    required: false,
  })
  department?: Department;
}
