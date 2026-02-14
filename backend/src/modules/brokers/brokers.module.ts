import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrokerEntity } from './entities/broker.entity';
import { BrokersController } from './brokers.controller';
import { BrokersService } from './brokers.service';

@Module({
  imports: [TypeOrmModule.forFeature([BrokerEntity])],
  controllers: [BrokersController],
  providers: [BrokersService],
  exports: [BrokersService],
})
export class BrokersModule {}
