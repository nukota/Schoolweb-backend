import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('teacher-profiles')
@ApiBearerAuth()
@Controller('teacher-profiles')
@UseGuards(JwtAuthGuard)
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

  @Get()
  @ApiOperation({ summary: 'Get all teacher profiles' })
  @ApiResponse({
    status: 200,
    description: 'Teacher profiles retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.teacherProfilesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get teacher profile by ID' })
  @ApiParam({ name: 'id', description: 'Teacher profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Teacher profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Teacher profile not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.teacherProfilesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update teacher profile by ID' })
  @ApiParam({ name: 'id', description: 'Teacher profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Teacher profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Teacher profile not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Body() updateTeacherProfileDto: UpdateTeacherProfileDto,
  ) {
    return this.teacherProfilesService.update(+id, updateTeacherProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete teacher profile by ID' })
  @ApiParam({ name: 'id', description: 'Teacher profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Teacher profile deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Teacher profile not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.teacherProfilesService.remove(+id);
  }
}
