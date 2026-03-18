import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ScannerService, ScanResult } from './scanner.service';

class StartScanDto {
  target!: string;
}

@Controller('api/scans')
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Post()
  async startScan(@Body() dto: StartScanDto): Promise<ScanResult> {
    return this.scannerService.startScan(dto.target);
  }

  @Get()
  getAllScans(): ScanResult[] {
    return this.scannerService.getAllScans();
  }

  @Get(':id')
  getScanResult(@Param('id') id: string): ScanResult | undefined {
    return this.scannerService.getScanResult(id);
  }
}
