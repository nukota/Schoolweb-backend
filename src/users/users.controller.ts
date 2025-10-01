import {
  Controller,
  UseGuards,
  Put,
  Get,
  Param,
  Body,
  Post,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { CreateStudentDTO } from './dto/create-student.dto';
import { UpdateStudentDTO } from './dto/update-student.dto';
import { CreateTeacherDTO } from './dto/create-teacher.dto';
import { UpdateTeacherDTO } from './dto/update-teacher.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('reset-password')
  @ApiOperation({ summary: 'Reset password (Teacher and Student)' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or Invalid old password',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  resetPassword(
    @CurrentUser() user: any,
    @Body() resetPasswordDTO: ResetPasswordDTO,
  ) {
    return this.usersService.resetPassword(user.user_id, resetPasswordDTO);
  }

  @Get('students')
  @ApiOperation({
    summary: 'Get all students with basic info (Admin and Teacher)',
  })
  @ApiResponse({
    status: 200,
    description: 'Students list retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getStudentsPage() {
    return this.usersService.getStudentsPage();
  }

  @Get('teachers')
  @ApiOperation({ summary: 'Get all teachers with detailed info (Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Teachers list retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTeachersPage() {
    return this.usersService.getTeachersPage();
  }

  @Get('students/:id')
  @ApiOperation({
    summary: 'Get detailed student information (Admin and Teacher)',
  })
  @ApiParam({
    name: 'id',
    description: 'Student user ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Student details retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  getStudentDetails(@Param('id') id: string) {
    return this.usersService.getStudentDetails(+id);
  }

  @Post('create-student')
  @ApiOperation({ summary: 'Create a new student (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Student created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  createStudent(@Body() createStudentDTO: CreateStudentDTO) {
    return this.usersService.createStudent(createStudentDTO);
  }

  @Put('update-student/:id')
  @ApiOperation({ summary: 'Update student information (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Student user ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Student updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  updateStudent(
    @Param('id') id: string,
    @Body() updateStudentDTO: UpdateStudentDTO,
  ) {
    return this.usersService.updateStudent(+id, updateStudentDTO);
  }

  @Delete('delete-student/:id')
  @ApiOperation({ summary: 'Delete student (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Student user ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Student deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  deleteStudent(@Param('id') id: string) {
    return this.usersService.deleteStudent(+id);
  }

  @Post('create-teacher')
  @ApiOperation({ summary: 'Create a new teacher (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Teacher created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  createTeacher(@Body() createTeacherDTO: CreateTeacherDTO) {
    return this.usersService.createTeacher(createTeacherDTO);
  }

  @Put('update-teacher/:id')
  @ApiOperation({ summary: 'Update teacher information (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Teacher user ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Teacher updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  updateTeacher(
    @Param('id') id: string,
    @Body() updateTeacherDTO: UpdateTeacherDTO,
  ) {
    return this.usersService.updateTeacher(+id, updateTeacherDTO);
  }

  @Delete('delete-teacher/:id')
  @ApiOperation({ summary: 'Delete teacher (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Teacher user ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Teacher deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  @ApiResponse({
    status: 409,
    description: 'Cannot delete teacher with active classes',
  })
  deleteTeacher(@Param('id') id: string) {
    return this.usersService.deleteTeacher(+id);
  }
}
