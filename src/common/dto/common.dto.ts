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

export class UpcomingClassDTO {
  class_name: string;
  class_code: string;
  department: Department;
  date: string;
  time: string;
}
