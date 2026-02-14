import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevRecScheduleEntity } from './entities/rev-rec-schedule.entity';
import { RevenueRecognitionController } from './revenue-recognition.controller';
import { RevenueRecognitionService } from './revenue-recognition.service';

@Module({
  imports: [TypeOrmModule.forFeature([RevRecScheduleEntity])],
  controllers: [RevenueRecognitionController],
  providers: [RevenueRecognitionService],
  exports: [RevenueRecognitionService],
})
export class RevenueRecognitionModule {}
