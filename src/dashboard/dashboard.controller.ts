import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardStudentService } from './services/dashboard-student.service';
import { DashboardTeacherService } from './services/dashboard-teacher.service';
import { DashboardAdminService } from './services/dashboard-admin.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TeacherDashboardDTO } from './dto/teacher-dashboard.dto';
import { StudentDashboardDTO } from './dto/student-dashboard.dto';
import { AdminDashboardDTO } from './dto/admin-dashboard.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardStudentService: DashboardStudentService,
    private readonly dashboardTeacherService: DashboardTeacherService,
    private readonly dashboardAdminService: DashboardAdminService,
  ) {}

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
    return this.dashboardStudentService.getStudentDashboard(user.user_id);
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
    return this.dashboardTeacherService.getTeacherDashboard(user.user_id);
  }

  @Get('admin')
  @ApiOperation({ summary: 'Get admin dashboard data (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Admin dashboard data retrieved successfully',
    type: AdminDashboardDTO,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAdminDashboard(): Promise<AdminDashboardDTO> {
    return this.dashboardAdminService.getAdminDashboard();
  }
}
