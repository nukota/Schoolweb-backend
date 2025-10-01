import { ApiProperty } from '@nestjs/swagger';
import {
  Stat,
  BarChartDataDTO,
  PieChartDataDTO,
} from '../../common/dto/common.dto';

export class AdminDashboardDTO {
  @ApiProperty({ description: 'Total teachers statistics' })
  total_teachers: Stat;

  @ApiProperty({ description: 'Total students statistics' })
  total_students: Stat;

  @ApiProperty({ description: 'Total classes statistics' })
  total_classes: Stat;

  @ApiProperty({ description: 'Total attendance statistics' })
  total_attendance: Stat;

  @ApiProperty({
    description: 'Bar chart data showing number of classes by department',
  })
  bar_chart_data: BarChartDataDTO;

  @ApiProperty({
    description:
      'Three pie charts: 1) teachers by department, 2) subjects by department, 3) grade proportions',
    type: 'array',
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          value: { type: 'number' },
        },
      },
    },
  })
  pie_chart_data: PieChartDataDTO[][];
}
