import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import {
  TeacherClassesDTO,
  TeacherClassDetailsDTO,
  StudentClassesDTO,
  StudentScheduleDTO,
  TeacherScheduleDTO,
} from './dto/class-views.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('classes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update class by ID' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class updated successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this.classesService.update(+id, updateClassDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete class by ID' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class deleted successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  remove(@Param('id') id: string) {
    return this.classesService.remove(+id);
  }

  @Get('teacher-classes')
  @ApiOperation({ summary: 'Get all classes for a teacher' })
  @ApiResponse({
    status: 200,
    description: 'Teacher classes retrieved successfully',
    type: TeacherClassesDTO,
  })
  getTeacherClasses(@Request() req): Promise<TeacherClassesDTO> {
    const teacherId = req.user.user_id;
    return this.classesService.getTeacherClasses(teacherId);
  }

  @Get('teacher-class/:id')
  @ApiOperation({ summary: 'Get detailed class information for teacher' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({
    status: 200,
    description: 'Teacher class details retrieved successfully',
    type: TeacherClassDetailsDTO,
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  getTeacherClassDetails(
    @Request() req,
    @Param('id') id: string,
  ): Promise<TeacherClassDetailsDTO> {
    const teacherId = req.user.user_id;
    return this.classesService.getTeacherClassDetails(+id, teacherId);
  }

  @Get('student-classes')
  @ApiOperation({ summary: 'Get all classes for the authenticated student' })
  @ApiResponse({
    status: 200,
    description: 'Student classes retrieved successfully',
    type: StudentClassesDTO,
  })
  getStudentClasses(@Request() req): Promise<StudentClassesDTO> {
    const studentId = req.user.user_id;
    return this.classesService.getStudentClasses(studentId);
  }

  @Get('student-schedule')
  @ApiOperation({
    summary: 'Get schedule for the authenticated student',
    description:
      'Requires start_date (Monday) and end_date (Sunday) query parameters of the same week',
  })
  @ApiQuery({
    name: 'start_date',
    description:
      'Start date of the week (must be a Monday, format: YYYY-MM-DD)',
    example: '2024-01-15',
    required: true,
  })
  @ApiQuery({
    name: 'end_date',
    description: 'End date of the week (must be a Sunday, format: YYYY-MM-DD)',
    example: '2024-01-21',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Student schedule retrieved successfully',
    type: StudentScheduleDTO,
  })
  @ApiResponse({ status: 400, description: 'Invalid date parameters' })
  getStudentSchedule(
    @Request() req,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ): Promise<StudentScheduleDTO> {
    this.validateWeekDates(startDate, endDate);
    const studentId = req.user.user_id;
    return this.classesService.getStudentSchedule(
      studentId,
      startDate,
      endDate,
    );
  }

  @Get('teacher-schedule')
  @ApiOperation({
    summary: 'Get schedule for the authenticated teacher',
    description:
      'Requires start_date (Monday) and end_date (Sunday) query parameters of the same week',
  })
  @ApiQuery({
    name: 'start_date',
    description:
      'Start date of the week (must be a Monday, format: YYYY-MM-DD)',
    example: '2024-01-15',
    required: true,
  })
  @ApiQuery({
    name: 'end_date',
    description: 'End date of the week (must be a Sunday, format: YYYY-MM-DD)',
    example: '2024-01-21',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Teacher schedule retrieved successfully',
    type: TeacherScheduleDTO,
  })
  @ApiResponse({ status: 400, description: 'Invalid date parameters' })
  getTeacherSchedule(
    @Request() req,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ): Promise<TeacherScheduleDTO> {
    this.validateWeekDates(startDate, endDate);
    const teacherId = req.user.user_id;
    return this.classesService.getTeacherSchedule(
      teacherId,
      startDate,
      endDate,
    );
  }

  private validateWeekDates(startDate: string, endDate: string): void {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'Both start_date and end_date query parameters are required',
      );
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Check if dates are valid
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      throw new BadRequestException(
        'Invalid date format. Use YYYY-MM-DD format.',
      );
    }

    // Check if start_date is Monday (getDay() returns 1 for Monday)
    if (startDateObj.getDay() !== 1) {
      throw new BadRequestException('start_date must be a Monday');
    }

    // Check if end_date is Sunday (getDay() returns 0 for Sunday)
    if (endDateObj.getDay() !== 0) {
      throw new BadRequestException('end_date must be a Sunday');
    }

    // Check if they are the same week (end_date should be 6 days after start_date)
    const timeDiff = endDateObj.getTime() - startDateObj.getTime();
    const dayDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (dayDiff !== 6) {
      throw new BadRequestException(
        'start_date and end_date must be Monday and Sunday of the same week',
      );
    }
  }
}
