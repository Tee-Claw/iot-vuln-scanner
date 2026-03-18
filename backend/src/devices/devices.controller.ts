import { Controller, Get, Param, Delete } from '@nestjs/common';
import { DevicesService, Device } from './devices.service';

@Controller('api/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  getAllDevices(): Device[] {
    return this.devicesService.getAllDevices();
  }

  @Get(':id')
  getDevice(@Param('id') id: string): Device | undefined {
    return this.devicesService.getDeviceById(id);
  }

  @Delete(':id')
  deleteDevice(@Param('id') id: string): { success: boolean } {
    const deleted = this.devicesService.deleteDevice(id);
    return { success: deleted };
  }
}
