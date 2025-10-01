import { Controller, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminDTO } from './dto/admin.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Put('update')
  @ApiOperation({ summary: 'Update admin email and/or password' })
  @ApiResponse({
    status: 200,
    description: 'Admin account updated successfully',
    type: AdminDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Admin account not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  updateAdmin(@Body() adminDTO: AdminDTO): Promise<AdminDTO> {
    return this.adminService.updateAdmin(adminDTO);
  }
}
