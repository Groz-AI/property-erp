import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceTicketEntity } from './entities/ticket.entity';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceTicketEntity])],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
