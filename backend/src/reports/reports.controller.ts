import { Controller, Get } from '@nestjs/common';

@Controller('api/reports')
export class ReportsController {
  @Get()
  getReports() {
    return { message: 'Reports endpoint - coming soon' };
  }
}
