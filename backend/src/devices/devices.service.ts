import { Injectable } from '@nestjs/common';

export interface Device {
  id: string;
  ip: string;
  mac: string;
  hostname?: string;
  vendor?: string;
  deviceType?: string;
  openPorts: number[];
  discoveredAt: Date;
  lastScanAt?: Date;
}

@Injectable()
export class DevicesService {
  private devices: Map<string, Device> = new Map();

  /**
   * Get all discovered devices
   */
  getAllDevices(): Device[] {
    return Array.from(this.devices.values());
  }

  /**
   * Get device by ID
   */
  getDeviceById(id: string): Device | undefined {
    return this.devices.get(id);
  }

  /**
   * Add or update a device
   */
  upsertDevice(device: Device): Device {
    this.devices.set(device.id, device);
    return device;
  }

  /**
   * Delete a device
   */
  deleteDevice(id: string): boolean {
    return this.devices.delete(id);
  }
}
