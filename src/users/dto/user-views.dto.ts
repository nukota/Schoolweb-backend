import { ApiProperty } from '@nestjs/swagger';
import { RegistrationSemesterDTO } from 'src/common/dto/registration-semesters.dto';

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
  full_name: string;

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

  @ApiProperty({
    type: [RegistrationSemesterDTO],
    description: 'Student registration history by semester',
  })
  registration_history: RegistrationSemesterDTO[];
}
