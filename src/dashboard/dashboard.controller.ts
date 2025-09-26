import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TeacherDashboardDTO } from './dto/teacher-dashboard.dto';
import { StudentDashboardDTO } from './dto/student-dashboard.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('student')
  @ApiOperation({ summary: 'Get student dashboard data (Student only)' })
  @ApiResponse({
    status: 200,
    description: 'Student dashboard data retrieved successfully',
    type: StudentDashboardDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStudentDashboard(
    @CurrentUser() user: any,
  ): Promise<StudentDashboardDTO> {
    return this.dashboardService.getStudentDashboard(user.user_id);
  }

  @Get('teacher')
  @ApiOperation({ summary: 'Get teacher dashboard data (Teacher only)' })
  @ApiResponse({
    status: 200,
    description: 'Teacher dashboard data retrieved successfully',
    type: TeacherDashboardDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTeacherDashboard(
    @CurrentUser() user: any,
  ): Promise<TeacherDashboardDTO> {
    return this.dashboardService.getTeacherDashboard(user.user_id);
  }
}
