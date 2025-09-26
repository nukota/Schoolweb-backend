import {
  Controller,
  UseGuards,
  Put,
  Get,
  Param,
  Body,
  Post,
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
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('reset-password')
  @ApiOperation({ summary: 'Reset password (Both)' })
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
    return this.usersService.resetPassword(user.user_id, resetPasswordDto);
  }

  @Get('students')
  @ApiOperation({ summary: 'Get all students with basic info (Teacher only)' })
  @ApiResponse({
    status: 200,
    description: 'Students list retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getStudentsPage() {
    return this.usersService.getStudentsPage();
  }

  @Get('students/:id')
  @ApiOperation({ summary: 'Get detailed student information (Teacher only)' })
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
  @ApiOperation({ summary: 'Create a new student (Teacher only)' })
  @ApiResponse({
    status: 201,
    description: 'Student created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  createStudent(@Body() createStudentDto: CreateStudentDto) {
    return this.usersService.createStudent(createStudentDto);
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
    return this.usersService.updateStudent(+id, updateStudentDto);
  }
}
