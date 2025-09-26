import { ApiProperty } from '@nestjs/swagger';
import {
  Stat,
  UpcomingClassDTO,
  BarChartDataDTO,
  PieChartDataDTO,
} from '../../common/dto/common.dto';
import { GradeType } from '../../common/enums';

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
    description: 'Current class scores for the student',
    example: [
      {
        class_name: 'Introduction to Programming',
        class_code: 'CS101',
        score: 8.5,
        type: 'midterm',
      },
    ],
  })
  current_class_scores: {
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
