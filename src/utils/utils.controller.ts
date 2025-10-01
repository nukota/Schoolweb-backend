import { Controller, Delete } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('utils')
@Controller('utils')
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

  @ApiOperation({ summary: 'Drop all data (except for admin account)' })
  @Delete('clear-database')
  async clearDatabase() {
    return await this.utilsService.clearAllData();
  }
}
