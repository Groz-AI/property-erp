import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HandoverEntity } from './entities/handover.entity';
import { HandoverController } from './handover.controller';
import { HandoverService } from './handover.service';

@Module({
  imports: [TypeOrmModule.forFeature([HandoverEntity])],
  controllers: [HandoverController],
  providers: [HandoverService],
  exports: [HandoverService],
})
export class HandoverModule {}
