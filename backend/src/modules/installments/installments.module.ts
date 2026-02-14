import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallmentEntity } from './entities/installment.entity';
import { InstallmentScheduleService } from './services/installment-schedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([InstallmentEntity])],
  providers: [InstallmentScheduleService],
  exports: [InstallmentScheduleService, TypeOrmModule],
})
export class InstallmentsModule {}
