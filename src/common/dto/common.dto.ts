import { Department, UserType } from '../enums';

// Base response DTO
export class BaseResponseDTO {
  success: boolean;
  message?: string;
}

// Statistics DTO used in dashboards
export class Stat {
  stat: number;
  change: number;
}

// Chart data DTOs
export class BarChartDataDTO {
  x_axis: string[];
  data: number[];
}

export class PieChartDataDTO {
  label: string;
  value: number;
}

// Common class info DTO
export class ClassInfoDTO {
  id: number;
  class_name: string;
  class_code: string;
  department: string;
  room?: string;
  schedule?: string;
}

// Common user info DTO
export class UserInfoDTO {
  id: number;
  full_name: string;
  user_type: UserType;
  department: Department;
  avatar_url?: string;
}

export class UpcomingClassDTO {
  class_name: string;
  class_code: string;
  department: Department;
  date: string;
  time: string;
}
