import { ApiProperty } from '@nestjs/swagger';
import {
  Stat,
  UpcomingClassDTO,
  BarChartDataDTO,
  PieChartDataDTO,
} from '../../common/dto/common.dto';

// DTO for Teacher Dashboard
export class TeacherDashboardDTO {
  @ApiProperty({ description: 'Total students statistics' })
  total_students: Stat;

  @ApiProperty({ description: 'Total classes statistics' })
  total_classes: Stat;

  @ApiProperty({ description: 'Student average score statistics' })
  student_avg_score: Stat;

  @ApiProperty({ description: 'Subjects statistics' })
  subjects: Stat;

  @ApiProperty({
    type: [String],
    description: 'Calendar dates',
    example: ['2024-01-15', '2024-01-16'],
  })
  calendar_dates: string[];

  @ApiProperty({
    type: [UpcomingClassDTO],
    description: 'List of upcoming classes',
  })
  upcoming_classes: UpcomingClassDTO[];

  @ApiProperty({ description: 'Bar chart data for dashboard' })
  bar_chart_data: BarChartDataDTO;

  @ApiProperty({
    type: [PieChartDataDTO],
    description: 'Pie chart data for dashboard',
  })
  pie_chart_data: PieChartDataDTO[];
}
