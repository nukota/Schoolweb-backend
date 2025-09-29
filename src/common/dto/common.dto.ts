import { ApiProperty } from '@nestjs/swagger';
import { Department, EnrollmentStatus } from '../enums';

// Base response DTO
export class BaseResponseDTO {
  @ApiProperty({
    example: true,
    description: 'Indicates if the operation was successful',
  })
  success: boolean;

  @ApiProperty({
    example: 'Operation completed successfully',
    description: 'Optional message providing additional information',
    required: false,
  })
  message?: string;
}

// Statistics DTO used in dashboards
export class Stat {
  @ApiProperty({
    example: 150,
    description: 'Current statistic value',
  })
  stat: number;

  @ApiProperty({
    example: 12.5,
    description: 'Percentage change from previous period',
  })
  change: number;
}

// Chart data DTOs
export class BarChartDataDTO {
  @ApiProperty({
    example: ['Jan', 'Feb', 'Mar', 'Apr'],
    description: 'X-axis labels for the bar chart',
    type: [String],
  })
  x_axis: string[];

  @ApiProperty({
    example: [120, 150, 180, 200],
    description: 'Data values for the bar chart',
    type: [Number],
  })
  data: number[];
}

export class PieChartDataDTO {
  @ApiProperty({
    example: 'Computer Science',
    description: 'Label for the pie chart segment',
  })
  label: string;

  @ApiProperty({
    example: 45.7,
    description: 'Value/percentage for the pie chart segment',
  })
  value: number;
}

export class UpcomingClassDTO {
  @ApiProperty({
    example: 'Introduction to Programming',
    description: 'Name of the class',
  })
  class_name: string;

  @ApiProperty({
    example: 'CS101',
    description: 'Unique class code',
  })
  class_code: string;

  @ApiProperty({
    enum: Department,
    example: Department.COMPUTER_SCIENCE,
    description: 'Department offering the class',
  })
  department: Department;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Date of the class in YYYY-MM-DD format',
  })
  date: string;

  @ApiProperty({
    example: '10:00 AM',
    description: 'Time of the class',
  })
  time: string;
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

  @ApiProperty({
    enum: Department,
    example: Department.COMPUTER_SCIENCE,
    description: 'Department',
  })
  department: Department;

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
