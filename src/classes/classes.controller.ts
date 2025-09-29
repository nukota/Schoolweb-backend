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
import { CreateClassDTO } from './dto/create-class.dto';
import { UpdateClassDTO } from './dto/update-class.dto';
import {
  TeacherClassesDTO,
  TeacherClassDetailsDTO,
  StudentClassesDTO,
  StudentScheduleDTO,
  TeacherScheduleDTO,
} from './dto/class-views.dto';
import {
  AddStudentsToClassDTO,
  RemoveStudentsFromClassDTO,
  EditStudentScoresDTO,
  ClassManagementResponseDTO,
} from './dto/class-management.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('classes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new class (Teacher only)' })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createClassDTO: CreateClassDTO) {
    return this.classesService.create(createClassDTO);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update class by ID (Teacher only)' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class updated successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  update(@Param('id') id: string, @Body() updateClassDTO: UpdateClassDTO) {
    return this.classesService.update(+id, updateClassDTO);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete class by ID (Teacher only)' })
  @ApiParam({ name: 'id', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class deleted successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  remove(@Param('id') id: string) {
    return this.classesService.remove(+id);
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
    return this.classesService.getTeacherClasses(teacherId);
  }

  @Get('teacher-class/:id')
  @ApiOperation({
    summary: 'Get detailed class information for teacher (Teacher only)',
  })
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
  @ApiOperation({ summary: 'Get all classes for the student (Student only)' })
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
    return this.classesService.getStudentSchedule(
      studentId,
      startDate,
      endDate,
    );
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
    return this.classesService.getTeacherSchedule(
      teacherId,
      startDate,
      endDate,
    );
  }

  @Post(':id/add-students')
  @ApiOperation({ summary: 'Add students to class (Teacher only)' })
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
    return this.classesService.addStudentsToClass(+id, addStudentsDTO);
  }

  @Delete(':id/remove-students')
  @ApiOperation({ summary: 'Remove students from class (Teacher only)' })
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
    return this.classesService.removeStudentsFromClass(+id, removeStudentsDTO);
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
    return this.classesService.editStudentScores(+id, editScoresDTO);
  }

  @Patch(':id/mark-complete')
  @ApiOperation({ summary: 'Mark class as completed (Teacher only)' })
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
    @Request() req,
  ): Promise<ClassManagementResponseDTO> {
    const teacherId = req.user.user_id;
    return this.classesService.markClassAsComplete(+id, teacherId);
  }
}
