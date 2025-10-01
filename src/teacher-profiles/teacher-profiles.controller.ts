import { Controller, Post, Body, UseGuards, Put, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TeacherProfilesService } from './teacher-profiles.service';
import { UpdateTeacherProfileDTO } from './dto/update-teacher-profile.dto';

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

  @Get('me')
  @ApiOperation({
    summary: 'Get current teacher profile with user info (Teacher only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Teacher profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  getMyProfile(@CurrentUser() user: any) {
    return this.teacherProfilesService.getProfileWithUser(user.user_id);
  }

  @Put()
  @ApiOperation({
    summary: 'Update teacher profile (Teacher only)',
    description:
      'Teachers can only update their email, date of birth (dob), and avatar URL (avatar_url)',
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
    @Body() updateTeacherProfileDTO: UpdateTeacherProfileDTO,
  ) {
    return this.teacherProfilesService.update(
      user.user_id,
      updateTeacherProfileDTO,
    );
  }
}
