import {
  Controller,
  Get,
  Post,
  Body,
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
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestsPageDTO } from './dto/request-views.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('requests')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new request' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createRequestDto: CreateRequestDto) {
    return this.requestsService.create(createRequestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all requests' })
  @ApiResponse({ status: 200, description: 'Requests retrieved successfully' })
  findAll() {
    return this.requestsService.findAll();
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all requests for requests page' })
  @ApiResponse({
    status: 200,
    description: 'Requests page data retrieved successfully',
    type: RequestsPageDTO,
  })
  getAllRequests(): Promise<RequestsPageDTO> {
    return this.requestsService.getAllRequests();
  }

  @Post('approve/:id')
  @ApiOperation({ summary: 'Approve request and handle enrollment' })
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
  @ApiOperation({ summary: 'Reject request' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request rejected successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  @ApiResponse({ status: 409, description: 'Request already processed' })
  rejectRequest(@Param('id') id: string) {
    return this.requestsService.rejectRequest(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete request by ID' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiResponse({ status: 200, description: 'Request deleted successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  remove(@Param('id') id: string) {
    return this.requestsService.remove(+id);
  }
}
