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
import { SubjectsService } from './subjects.service';
import { CreateSubjectDTO } from './dto/create-subject.dto';
import { UpdateSubjectDTO } from './dto/update-subject.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('subjects')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subject (Teacher only)' })
  @ApiResponse({ status: 201, description: 'Subject created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createSubjectDTO: CreateSubjectDTO) {
    return this.subjectsService.create(createSubjectDTO);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subjects (Teacher only)' })
  @ApiResponse({ status: 200, description: 'Subjects retrieved successfully' })
  findAll() {
    return this.subjectsService.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subject by ID (Teacher only)' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiResponse({ status: 200, description: 'Subject updated successfully' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  update(@Param('id') id: string, @Body() updateSubjectDTO: UpdateSubjectDTO) {
    return this.subjectsService.update(+id, updateSubjectDTO);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subject by ID (Teacher only)' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiResponse({ status: 200, description: 'Subject deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(+id);
  }
}
