import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from './entities/booking.entity';
import { UnitEntity } from '../properties/entities/unit.entity';
import { BookingsController } from './bookings.controller';
import { BookingService } from './services/booking.service';

@Module({
  imports: [TypeOrmModule.forFeature([BookingEntity, UnitEntity])],
  controllers: [BookingsController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingsModule {}
