import { Controller, Get, Post, Body, Patch, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentProfilesService } from './student-profiles.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('student-profiles')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('student-profiles')
export class StudentProfilesController {
  constructor(
    private readonly studentProfilesService: StudentProfilesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create student profile' })
  @ApiResponse({
    status: 201,
    description: 'Student profile created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Profile already exists' })
  create(
    @CurrentUser() user: any,
    @Body() createStudentProfileDto: CreateStudentProfileDto,
  ) {
    return this.studentProfilesService.create(
      user.user_id,
      createStudentProfileDto,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current student profile with user info' })
  @ApiResponse({
    status: 200,
    description: 'Student profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  getMyProfile(@CurrentUser() user: any) {
    return this.studentProfilesService.getProfileWithUser(user.user_id);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update student profile',
    description:
      'Students can update their phone, date of birth, email, and avatar URL',
  })
  @ApiResponse({
    status: 200,
    description: 'Student profile updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  update(
    @CurrentUser() user: any,
    @Body() updateStudentProfileDto: UpdateStudentProfileDto,
  ) {
    return this.studentProfilesService.update(
      user.user_id,
      updateStudentProfileDto,
    );
  }
}
