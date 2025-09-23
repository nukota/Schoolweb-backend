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
  current_semester_gpa: Stat;
  cumulative_gpa: Stat;
  credits_completed: Stat;
  credits_in_progress: Stat;
  upcoming_classes: UpcomingClassDTO[];
  recent_grades: {
    class_name: string;
    class_code: string;
    score: number; // on the scale of 0-10
    type: GradeType;
  }[];
  bar_chart_data: BarChartDataDTO;
  pie_chart_data: PieChartDataDTO[];
}

// DTO class for My Classes Page
export class StudentClassDTO {
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
  requested_to_drop?: boolean;
}

export class StudentClassesDTO {
  current_classes: StudentClassDTO[];
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
  user_id: number;
  full_name: string;
  dob?: string;
  password_hash: string;
  avatar_url?: string;
  department: Department;
  student_id: number;
  phone?: string;
  email?: string;
  enrollment_year?: number;
}

export class UpdateStudentProfileDTO {
  full_name?: string;
  dob?: string;
  password_hash?: string;
  avatar_url?: string;
  phone?: string;
  email?: string;
}
