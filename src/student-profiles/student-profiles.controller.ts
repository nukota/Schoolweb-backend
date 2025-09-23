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
import { StudentProfilesService } from './student-profiles.service';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('student-profiles')
@ApiBearerAuth()
@Controller('student-profiles')
@UseGuards(JwtAuthGuard)
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
  create(
    @CurrentUser() user: any,
    @Body() createStudentProfileDto: CreateStudentProfileDto,
  ) {
    return this.studentProfilesService.create(
      user.user_id,
      createStudentProfileDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all student profiles' })
  @ApiResponse({
    status: 200,
    description: 'Student profiles retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.studentProfilesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student profile by ID' })
  @ApiParam({ name: 'id', description: 'Student profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Student profile retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Student profile not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.studentProfilesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update student profile by ID' })
  @ApiParam({ name: 'id', description: 'Student profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Student profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Student profile not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Body() updateStudentProfileDto: UpdateStudentProfileDto,
  ) {
    return this.studentProfilesService.update(+id, updateStudentProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete student profile by ID' })
  @ApiParam({ name: 'id', description: 'Student profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Student profile deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Student profile not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.studentProfilesService.remove(+id);
  }
}
