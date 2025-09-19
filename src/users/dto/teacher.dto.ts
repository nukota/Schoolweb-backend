import {
  Stat,
  UpcomingClassDTO,
  BarChartDataDTO,
  PieChartDataDTO,
} from 'src/common/dto/common.dto';
import { ClassStatus, Department } from '../../common/enums';
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
  id: number;
  class_name: string;
  class_code: string;
  department: string;
  size: number;
  max_size: number;
  semester: string;
  schedule: string;
  room: string;
  credits: number;
  status?: ClassStatus;
}

export class TeacherClassesDTO {
  classes: TeacherClassDTO[];
}

//DTO for Class Details Page
export class ClassMemberDTO {
  id: number;
  full_name: string;
  student_id: string;
  avatar?: string;
  scores: number[];
}

export class TeacherClassDetailsDTO extends TeacherClassDTO {
  is_editable: boolean;
  members: ClassMemberDTO[];
}

//DTO for Creating a new class
export class CreateClassDTO {
  subject_id: number | '';
  class_code: string;
  department: Department | '';
  room: string;
  day: string;
  time: string;
  credits?: number;
  max_size?: number;
  semester?: string;
}

//DTO for Schedule Page
export class TeacherScheduleItemDTO {
  id: number;
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
  id: number;
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

// DTO for inserting a new student
export class CreateStudentDTO {
  student_id?: string;
  full_name: string;
  password: string;
  avatar_url?: string;
  department?: string;
  phone?: string;
  email?: string;
  enrollment_year?: number;
}

// DTO for Student Details Page
export class StudentDetailsDTO {
  id: number;
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
