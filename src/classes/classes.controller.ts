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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateClassDTO } from './dto/create-class.dto';
import { UpdateClassDTO } from './dto/update-class.dto';
import {
  TeacherClassesDTO,
  StudentClassesDTO,
  StudentScheduleDTO,
  TeacherScheduleDTO,
  AdminClassesDTO,
  ClassDetailsDTO,
} from './dto/class-views.dto';
import {
  AddStudentsToClassDTO,
  RemoveStudentsFromClassDTO,
  EditStudentScoresDTO,
  ClassManagementResponseDTO,
} from './dto/class-management.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ClassesAdminService } from './services/classes-admin.service';
import { ClassesTeacherService } from './services/classes-teacher.service';
import { ClassesStudentService } from './services/classes-student.service';

@ApiTags('classes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('classes')
export class ClassesController {
  constructor(
    private readonly classesAdminService: ClassesAdminService,
    private readonly classesTeacherService: ClassesTeacherService,
    private readonly classesStudentService: ClassesStudentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new class (Admin only)' })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createClassDTO: CreateClassDTO) {
    return this.classesAdminService.create(createClassDTO);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update class by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class updated successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  update(@Param('id') id: string, @Body() updateClassDTO: UpdateClassDTO) {
    return this.classesAdminService.update(+id, updateClassDTO);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete class by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class deleted successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  remove(@Param('id') id: string) {
    return this.classesAdminService.remove(+id);
  }

  @Get('all-classes')
  @ApiOperation({ summary: 'Get all classes (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'All classes retrieved successfully',
    type: AdminClassesDTO,
  })
  getAllClasses(): Promise<AdminClassesDTO> {
    return this.classesAdminService.getAllClasses();
  }

  @Get('class-details/:id')
  @ApiOperation({
    summary: 'Get detailed class information (Admin and Teacher)',
  })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({
    status: 200,
    description: 'Class details retrieved successfully',
    type: ClassDetailsDTO,
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  getClassDetails(@Param('id') id: string): Promise<ClassDetailsDTO> {
    return this.classesTeacherService.getClassDetails(+id);
  }

  @Get('student-classes')
  @ApiOperation({ summary: 'Get all classes for the student (Student only)' })
  @ApiResponse({
    status: 200,
    description: 'Student classes retrieved successfully',
    type: StudentClassesDTO,
  })
  getStudentClasses(@Request() req): Promise<StudentClassesDTO> {
    const studentId = req.user.user_id;
    return this.classesStudentService.getStudentClasses(studentId);
  }

  @Get('student-schedule')
  @ApiOperation({
    summary: 'Get schedule for the student (Student only)',
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
    const studentId = req.user.user_id;
    return this.classesStudentService.getStudentSchedule(
      studentId,
      startDate,
      endDate,
    );
  }

  @Get('teacher-classes')
  @ApiOperation({ summary: 'Get all classes for a teacher (Teacher only)' })
  @ApiResponse({
    status: 200,
    description: 'Teacher classes retrieved successfully',
    type: TeacherClassesDTO,
  })
  getTeacherClasses(@Request() req): Promise<TeacherClassesDTO> {
    const teacherId = req.user.user_id;
    return this.classesTeacherService.getTeacherClasses(teacherId);
  }

  @Get('teacher-schedule')
  @ApiOperation({
    summary: 'Get schedule for the teacher (Teacher only)',
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
    const teacherId = req.user.user_id;
    return this.classesTeacherService.getTeacherSchedule(
      teacherId,
      startDate,
      endDate,
    );
  }

  @Post(':id/add-students')
  @ApiOperation({ summary: 'Add students to class (Admin only)' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({
    status: 200,
    description: 'Students added successfully',
    type: ClassManagementResponseDTO,
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  addStudentsToClass(
    @Param('id') id: string,
    @Body() addStudentsDTO: AddStudentsToClassDTO,
  ): Promise<ClassManagementResponseDTO> {
    return this.classesAdminService.addStudentsToClass(+id, addStudentsDTO);
  }

  @Delete(':id/remove-students')
  @ApiOperation({ summary: 'Remove students from class (Admin only)' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({
    status: 200,
    description: 'Students removed successfully',
    type: ClassManagementResponseDTO,
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  removeStudentsFromClass(
    @Param('id') id: string,
    @Body() removeStudentsDTO: RemoveStudentsFromClassDTO,
  ): Promise<ClassManagementResponseDTO> {
    return this.classesAdminService.removeStudentsFromClass(
      +id,
      removeStudentsDTO,
    );
  }

  @Patch(':id/edit-scores')
  @ApiOperation({ summary: 'Edit student scores for class (Teacher only)' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({
    status: 200,
    description: 'Student scores updated successfully',
    type: ClassManagementResponseDTO,
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  editStudentScores(
    @Param('id') id: string,
    @Body() editScoresDTO: EditStudentScoresDTO,
  ): Promise<ClassManagementResponseDTO> {
    return this.classesTeacherService.editStudentScores(+id, editScoresDTO);
  }

  @Patch(':id/mark-complete')
  @ApiOperation({ summary: 'Mark class as completed (Admin only)' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({
    status: 200,
    description: 'Class marked as completed successfully',
    type: ClassManagementResponseDTO,
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  markClassAsComplete(
    @Param('id') id: string,
  ): Promise<ClassManagementResponseDTO> {
    return this.classesAdminService.markClassAsComplete(+id);
  }
}
