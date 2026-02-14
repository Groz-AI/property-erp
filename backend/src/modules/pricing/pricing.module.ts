import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceListEntity } from './entities/price-list.entity';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';

@Module({
  imports: [TypeOrmModule.forFeature([PriceListEntity])],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
