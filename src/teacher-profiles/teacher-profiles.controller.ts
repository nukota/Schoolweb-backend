import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TeacherProfilesService } from './teacher-profiles.service';
import { CreateTeacherProfileDto } from './dto/create-teacher-profile.dto';
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('teacher-profiles')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('teacher-profiles')
export class TeacherProfilesController {
  constructor(
    private readonly teacherProfilesService: TeacherProfilesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create teacher profile' })
  @ApiResponse({
    status: 201,
    description: 'Teacher profile created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @CurrentUser() user: any,
    @Body() createTeacherProfileDto: CreateTeacherProfileDto,
  ) {
    return this.teacherProfilesService.create(
      user.user_id,
      createTeacherProfileDto,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current teacher profile with user info' })
  @ApiResponse({
    status: 200,
    description: 'Teacher profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  getMyProfile(@CurrentUser() user: any) {
    return this.teacherProfilesService.getProfileWithUser(user.user_id);
  }

  @Post('create-student')
  @ApiOperation({ summary: 'Create a new student (Teacher only)' })
  @ApiResponse({
    status: 201,
    description: 'Student created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.teacherProfilesService.createStudent(createStudentDto);
  }

  @Put('update-student/:id')
  @ApiOperation({ summary: 'Update student information (Teacher only)' })
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
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.teacherProfilesService.updateStudent(+id, updateStudentDto);
  }

  @Put('reset-password')
  @ApiOperation({ summary: 'Reset password (Student and Teacher)' })
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
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.teacherProfilesService.resetPassword(
      user.user_id,
      resetPasswordDto,
    );
  }

  @Put()
  @ApiOperation({
    summary: 'Update teacher profile',
    description:
      'Teachers can update their own profile and user info (email, full_name, avatar_url, dob, position, department, hire_date)',
  })
  @ApiResponse({
    status: 200,
    description: 'Teacher profile updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  update(
    @CurrentUser() user: any,
    @Body() updateTeacherProfileDto: UpdateTeacherProfileDto,
  ) {
    return this.teacherProfilesService.update(
      user.user_id,
      updateTeacherProfileDto,
    );
  }
}
