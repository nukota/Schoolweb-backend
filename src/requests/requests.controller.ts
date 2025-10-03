import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RequestsService } from './requests.service';
import { CreateRequestDTO } from './dto/create-request.dto';
import { RequestsPageDTO } from './dto/request-views.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('requests')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new request (Student only)' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@CurrentUser() user, @Body() createRequestDTO: CreateRequestDTO) {
    return this.requestsService.create(user.user_id, createRequestDTO);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all requests for requests page (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Requests page data retrieved successfully',
    type: RequestsPageDTO,
  })
  getAllRequests(@CurrentUser() user): Promise<RequestsPageDTO> {
    return this.requestsService.getAllRequests();
  }

  @Post('approve/:id')
  @ApiOperation({
    summary: 'Approve request and handle enrollment (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request approved successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @ApiResponse({
    status: 409,
    description: 'Request already processed or enrollment conflict',
  })
  approveRequest(@Param('id') id: string) {
    return this.requestsService.approveRequest(+id);
  }

  @Post('reject/:id')
  @ApiOperation({ summary: 'Reject request (Admin only)' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request rejected successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @ApiResponse({ status: 409, description: 'Request already processed' })
  rejectRequest(@Param('id') id: string) {
    return this.requestsService.rejectRequest(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete request by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request deleted successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  remove(@Param('id') id: string) {
    return this.requestsService.remove(+id);
  }
}
