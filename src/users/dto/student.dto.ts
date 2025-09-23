import { ApiProperty } from '@nestjs/swagger';
import {
  Stat,
  UpcomingClassDTO,
  BarChartDataDTO,
  PieChartDataDTO,
} from 'src/common/dto/common.dto';
import {
  ClassStatus,
  Department,
  EnrollmentStatus,
  GradeType,
  RegistrationStatus,
} from '../../common/enums';

export class StudentDashboardDTO {
  @ApiProperty({ description: 'Current semester GPA statistics' })
  current_semester_gpa: Stat;

  @ApiProperty({ description: 'Cumulative GPA statistics' })
  cumulative_gpa: Stat;

  @ApiProperty({ description: 'Credits completed statistics' })
  credits_completed: Stat;

  @ApiProperty({ description: 'Credits in progress statistics' })
  credits_in_progress: Stat;

  @ApiProperty({
    type: [UpcomingClassDTO],
    description: 'List of upcoming classes',
  })
  upcoming_classes: UpcomingClassDTO[];

  @ApiProperty({
    description: 'Recent grades for the student',
    example: [
      {
        class_name: 'Introduction to Programming',
        class_code: 'CS101',
        score: 8.5,
        type: 'midterm',
      },
    ],
  })
  recent_grades: {
    class_name: string;
    class_code: string;
    score: number; // on the scale of 0-10
    type: GradeType;
  }[];

  @ApiProperty({ description: 'Bar chart data for dashboard' })
  bar_chart_data: BarChartDataDTO;

  @ApiProperty({
    type: [PieChartDataDTO],
    description: 'Pie chart data for dashboard',
  })
  pie_chart_data: PieChartDataDTO[];
}

// DTO class for My Classes Page
export class StudentClassDTO {
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

  @ApiProperty({
    example: false,
    description: 'Whether drop request was made',
    required: false,
  })
  requested_to_drop?: boolean;
}

export class StudentClassesDTO {
  @ApiProperty({
    type: [StudentClassDTO],
    description: 'Current enrolled classes',
  })
  current_classes: StudentClassDTO[];

  @ApiProperty({ type: [StudentClassDTO], description: 'Completed classes' })
  completed_classes: StudentClassDTO[];
}

//DTO class for Schedule Page
export class StudentScheduleItemDTO {
  department: Department;
  class_name: string;
  class_code: string;
  teacher_name: string;
  start_time: string;
  end_time: string;
  room: string;
  day: string;
}

export class StudentScheduleDTO {
  schedule: StudentScheduleItemDTO[];
}

// DTO classes for Registering Classes Page
export class RegisterClassDto {
  class_id: number;
  class_name: string;
  class_code: string;
  teacher_name: string;
  department: string;
  start_date?: string;
  end_date?: string;
  day?: string;
  start_time?: string;
  end_time?: string;
  room: string;
  credits: number;
  max_students: number;
  enrolled_students: number;
  description: string;
  status: ClassStatus;
}

export class RegistrationClassesDTO {
  available_classes: RegisterClassDto[];
}

// DTO classes for Academic Results
export class ClassResultDTO {
  class_code: string;
  class_name: string;
  department: string;
  credits: number;
  scores: number[]; // Array of 5 numbers: [coursework, lab, midterm, final, average]
  status: EnrollmentStatus;
  instructor: string;
}

export class SemesterDTO {
  semester: string;
  classes: ClassResultDTO[];
}

export class AcademicResultsDTO {
  semesters: SemesterDTO[];
}

// DTO classes for Registration History
export class RegistrationClassDTO {
  class_code: string;
  class_name: string;
  department: string;
  instructor: string;
  credits: number;
  registrationStatus: RegistrationStatus;
}

export class RegistrationSemesterDTO {
  semester: string;
  totalCredits: number;
  classes: RegistrationClassDTO[];
}

export class RegistrationHistoryDTO {
  semesters: RegistrationSemesterDTO[];
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
