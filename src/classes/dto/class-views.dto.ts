import { ApiProperty } from '@nestjs/swagger';
import { Department } from '../../common/enums';

// DTO for All Classes Page - Teacher View
export class TeacherClassDTO {
  @ApiProperty({ example: 1, description: 'Class ID' })
  class_id: number;

  @ApiProperty({
    example: 'Introduction to Programming',
    description: 'Class name',
  })
  class_name: string;

  @ApiProperty({ example: 'CS101', description: 'Class code' })
  class_code: string;

  @ApiProperty({
    enum: Department,
    example: Department.COMPUTER_SCIENCE,
    description: 'Department',
  })
  department: Department;

  @ApiProperty({ example: 25, description: 'Current class size' })
  size: number;

  @ApiProperty({ example: 30, description: 'Maximum class size' })
  max_size: number;

  @ApiProperty({ example: 'Fall 2024', description: 'Semester' })
  semester: string;

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
}

export class TeacherClassesDTO {
  @ApiProperty({
    type: [TeacherClassDTO],
    description: 'List of teacher classes',
  })
  classes: TeacherClassDTO[];
}

//DTO for Class Details Page
export class ClassMemberDTO {
  @ApiProperty({ example: 1, description: 'User ID' })
  user_id: number;

  @ApiProperty({ example: 'John Doe', description: 'Student full name' })
  full_name: string;

  @ApiProperty({ example: '12345', description: 'Student ID' })
  student_id: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    example: [8.5, 9.0, 7.5, 8.0],
    description: 'Student scores array',
    type: [Number],
  })
  scores: number[];
}

export class TeacherClassDetailsDTO extends TeacherClassDTO {
  @ApiProperty({ example: true, description: 'Whether class is editable' })
  is_editable: boolean;

  @ApiProperty({
    type: [ClassMemberDTO],
    description: 'List of class members',
  })
  members: ClassMemberDTO[];
}

// DTO class for My Classes Page - Student View
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

  @ApiProperty({
    enum: Department,
    example: Department.COMPUTER_SCIENCE,
    description: 'Department',
  })
  department: Department;

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

//DTO for Schedule Page
export class StudentScheduleItemDTO {
  @ApiProperty({
    enum: Department,
    example: Department.COMPUTER_SCIENCE,
    description: 'Department',
  })
  department: Department;

  @ApiProperty({
    example: 'Introduction to Programming',
    description: 'Class name',
  })
  class_name: string;

  @ApiProperty({ example: 'CS101.A01', description: 'Class code' })
  class_code: string;

  @ApiProperty({ example: 'Dr. Smith', description: 'Teacher name' })
  teacher_name: string;

  @ApiProperty({ example: '10:00 AM', description: 'Start time' })
  start_time: string;

  @ApiProperty({ example: '11:30 AM', description: 'End time' })
  end_time: string;

  @ApiProperty({ example: 'A101', description: 'Classroom' })
  room: string;

  @ApiProperty({ example: 'Monday', description: 'Day of week' })
  day: string;
}

export class StudentScheduleDTO {
  @ApiProperty({
    type: [StudentScheduleItemDTO],
    description: 'Student schedule items',
  })
  schedule: StudentScheduleItemDTO[];
}

export class TeacherScheduleItemDTO {
  @ApiProperty({
    enum: Department,
    example: Department.COMPUTER_SCIENCE,
    description: 'Department',
  })
  department: Department;

  @ApiProperty({
    example: 'Introduction to Programming',
    description: 'Class name',
  })
  class_name: string;

  @ApiProperty({ example: 'CS101', description: 'Class code' })
  class_code: string;

  @ApiProperty({ example: '10:00 AM', description: 'Start time' })
  start_time: string;

  @ApiProperty({ example: '11:30 AM', description: 'End time' })
  end_time: string;

  @ApiProperty({ example: 'Room 101', description: 'Classroom' })
  room: string;

  @ApiProperty({ example: 'Monday', description: 'Day of week' })
  day: string;
}

export class TeacherScheduleDTO {
  @ApiProperty({
    type: [TeacherScheduleItemDTO],
    description: 'Teacher schedule items',
  })
  schedule: TeacherScheduleItemDTO[];
}
