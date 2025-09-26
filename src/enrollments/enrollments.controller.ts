import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import {
  RegistrationClassesDTO,
  AcademicResultsDTO,
  RegistrationHistoryDTO,
} from './dto/enrollment-views.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('enrollments')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}
  @Get('registration-classes')
  @ApiOperation({ summary: 'Get available classes for registration' })
  @ApiResponse({
    status: 200,
    description: 'Registration classes retrieved successfully',
    type: RegistrationClassesDTO,
  })
  getRegistrationClasses(
    @CurrentUser() user: any,
  ): Promise<RegistrationClassesDTO> {
    return this.enrollmentsService.getRegistrationClasses(user.user_id);
  }

  @Get('academic-results')
  @ApiOperation({ summary: 'Get academic results' })
  @ApiResponse({
    status: 200,
    description: 'Academic results retrieved successfully',
    type: AcademicResultsDTO,
  })
  getAcademicResults(@CurrentUser() user: any): Promise<AcademicResultsDTO> {
    return this.enrollmentsService.getAcademicResults(user.user_id);
  }

  @Get('registration-history')
  @ApiOperation({ summary: 'Get registration history' })
  @ApiResponse({
    status: 200,
    description: 'Registration history retrieved successfully',
    type: RegistrationHistoryDTO,
  })
  getRegistrationHistory(
    @CurrentUser() user: any,
  ): Promise<RegistrationHistoryDTO> {
    return this.enrollmentsService.getRegistrationHistory(user.user_id);
  }
}
