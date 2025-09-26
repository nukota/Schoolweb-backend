import { ApiProperty } from '@nestjs/swagger';
import { ClassStatus, EnrollmentStatus } from '../../common/enums';

// DTO classes for Registering Classes Page
export class RegisterClassDto {
  @ApiProperty({ example: 1, description: 'Class ID' })
  class_id: number;

  @ApiProperty({
    example: 'Introduction to Programming',
    description: 'Class name',
  })
  class_name: string;

  @ApiProperty({ example: 'CS101', description: 'Class code' })
  class_code: string;

  @ApiProperty({ example: 'Dr. Smith', description: 'Teacher name' })
  teacher_name: string;

  @ApiProperty({ example: 'Computer Science', description: 'Department name' })
  department: string;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Start date',
    required: false,
  })
  start_date?: string;

  @ApiProperty({
    example: '2024-05-15',
    description: 'End date',
    required: false,
  })
  end_date?: string;

  @ApiProperty({
    example: 'Monday',
    description: 'Day of week',
    required: false,
  })
  day?: string;

  @ApiProperty({
    example: '10:00 AM',
    description: 'Start time',
    required: false,
  })
  start_time?: string;

  @ApiProperty({
    example: '11:30 AM',
    description: 'End time',
    required: false,
  })
  end_time?: string;

  @ApiProperty({ example: 'Room 101', description: 'Classroom' })
  room: string;

  @ApiProperty({ example: 3, description: 'Credit hours' })
  credits: number;

  @ApiProperty({ example: 30, description: 'Maximum students' })
  max_students: number;

  @ApiProperty({ example: 25, description: 'Currently enrolled students' })
  enrolled_students: number;

  @ApiProperty({
    example: 'Introduction to programming concepts',
    description: 'Class description',
  })
  description: string;

  @ApiProperty({ enum: ClassStatus, description: 'Class status' })
  status: ClassStatus;
}

export class RegistrationClassesDTO {
  @ApiProperty({
    type: [RegisterClassDto],
    description: 'Available classes for registration',
  })
  available_classes: RegisterClassDto[];
}

// DTO classes for Academic Results
export class ClassResultDTO {
  @ApiProperty({ example: 'CS101', description: 'Class code' })
  class_code: string;

  @ApiProperty({
    example: 'Introduction to Programming',
    description: 'Class name',
  })
  class_name: string;

  @ApiProperty({ example: 'Computer Science', description: 'Department name' })
  department: string;

  @ApiProperty({ example: 3, description: 'Credit hours' })
  credits: number;

  @ApiProperty({
    example: [8.5, 9.0, 7.5, 8.0, 8.25],
    description:
      'Array of 5 numbers: [coursework, lab, midterm, final, average]',
    type: [Number],
  })
  scores: number[]; // Array of 5 numbers: [coursework, lab, midterm, final, average]

  @ApiProperty({ enum: EnrollmentStatus, description: 'Enrollment status' })
  status: EnrollmentStatus;

  @ApiProperty({ example: 'Dr. Smith', description: 'Teacher name' })
  teacher_name: string;
}

export class SemesterDTO {
  @ApiProperty({ example: 'Fall 2024', description: 'Semester name' })
  semester: string;

  @ApiProperty({
    type: [ClassResultDTO],
    description: 'Classes for this semester',
  })
  classes: ClassResultDTO[];
}

export class AcademicResultsDTO {
  @ApiProperty({
    type: [SemesterDTO],
    description: 'Academic results by semester',
  })
  semesters: SemesterDTO[];
}

// DTO classes for Registration History
export class RegistrationClassDTO {
  @ApiProperty({ example: 'CS101', description: 'Class code' })
  class_code: string;

  @ApiProperty({
    example: 'Introduction to Programming',
    description: 'Class name',
  })
  class_name: string;

  @ApiProperty({ example: 'Computer Science', description: 'Department name' })
  department: string;

  @ApiProperty({ example: 'Dr. Smith', description: 'Teacher name' })
  teacher_name: string;

  @ApiProperty({ example: 3, description: 'Credit hours' })
  credits: number;

  @ApiProperty({
    example: 'enrolled',
    description: 'Registration status',
    enum: EnrollmentStatus,
  })
  registration_status: EnrollmentStatus;
}

export class RegistrationSemesterDTO {
  @ApiProperty({ example: 'Fall 2024', description: 'Semester name' })
  semester: string;

  @ApiProperty({ example: 15, description: 'Total credits for semester' })
  total_credits: number;

  @ApiProperty({
    type: [RegistrationClassDTO],
    description: 'Classes registered for this semester',
  })
  classes: RegistrationClassDTO[];
}

export class RegistrationHistoryDTO {
  @ApiProperty({
    type: [RegistrationSemesterDTO],
    description: 'Registration history by semester',
  })
  semesters: RegistrationSemesterDTO[];
}
