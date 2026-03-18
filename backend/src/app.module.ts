import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScannerModule } from './scanner/scanner.module';
import { DevicesModule } from './devices/devices.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScannerModule,
    DevicesModule,
    ReportsModule,
  ],
})
export class AppModule {}
