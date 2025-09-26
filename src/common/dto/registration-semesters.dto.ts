import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '../../common/enums';

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
