import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractEntity } from './entities/contract.entity';
import { BookingEntity } from '../bookings/entities/booking.entity';
import { UnitEntity } from '../properties/entities/unit.entity';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContractEntity, BookingEntity, UnitEntity])],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
