import {
  Stat,
  UpcomingClassDTO,
  BarChartDataDTO,
  PieChartDataDTO,
} from 'src/common/dto/common.dto';
import {
  ClassStatus,
  Department,
  RequestStatus,
  RequestType,
} from '../../common/enums';
import { RegistrationHistoryDTO } from './student.dto';

// DTO for Teacher Dashboard
export class TeacherDashboardDTO {
  total_students: Stat;
  total_classes: Stat;
  student_avg_score: Stat;
  subjects: Stat;
  calendar_dates: string[];
  upcoming_classes: UpcomingClassDTO[];
  bar_chart_data: BarChartDataDTO;
  pie_chart_data: PieChartDataDTO[];
}

// DTO for All Classes Page
export class TeacherClassDTO {
  class_id: number;
  class_name: string;
  class_code: string;
  department: string;
  size: number;
  max_size: number;
  semester: string;
  start_date?: string;
  end_date?: string;
  day?: string;
  start_time?: string;
  end_time?: string;
  room: string;
  credits: number;
}

export class TeacherClassesDTO {
  classes: TeacherClassDTO[];
}

//DTO for Class Details Page
export class ClassMemberDTO {
  user_id: number;
  full_name: string;
  student_id: string;
  avatar?: string;
  scores: number[];
}

export class TeacherClassDetailsDTO extends TeacherClassDTO {
  is_editable: boolean;
  members: ClassMemberDTO[];
}

//DTO for Schedule Page
export class TeacherScheduleItemDTO {
  department: Department;
  class_name: string;
  class_code: string;
  start_time: string;
  end_time: string;
  room: string;
  day: string;
}

export class TeacherScheduleDTO {
  schedule: TeacherScheduleItemDTO[];
}

// DTO for Students List Page
export class StudentListItemDTO {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  gpa: number;
  avatar?: string;
  student_id?: string;
}

export class StudentsPageDTO {
  students: StudentListItemDTO[];
}

// DTO for Student Details Page
export class StudentDetailsDTO {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  gpa: number;
  avatar?: string;
  student_id: string;
  department: string;
  enrollment_year: number;
  //
  total_credits: number;
  total_semesters: number;
  completed_classes: number;
  total_classes: number;
  //
  registration_history: RegistrationHistoryDTO;
}

// DTO for updating student scores
export class UpdateStudentScoresDTO {
  student_id: number;
  scores: number[]; // [coursework, lab, midterm, final]
}

//DTO for Requests Page
export class RequestDTO {
  request_id: number;
  student_id: string;
  student_name: string;
  email: string;
  phone: string;
  request_type: RequestType;
  class_code: string;
  class_name: string;
  status: RequestStatus;
  submitted_date: string;
  reviewed_date?: string;
  message: string;
  avatar_url?: string;
}

export class RequestsPageDTO {
  requests: RequestDTO[];
}

//DTO for Profile Page
export class TeacherProfileDTO {
  user_id: number;
  full_name: string;
  dob?: string; // ISO date string
  password_hash: string;
  avatar_url?: string;
  department: Department;
  teacher_id: number;
  position?: string;
  hire_date?: string;
}
export class UpdateProfileDTO {
  full_name?: string;
  dob?: string;
  password?: string;
  avatar_url?: string;
  department?: Department;
}
