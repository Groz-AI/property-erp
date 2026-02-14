import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorEntity } from './entities/vendor.entity';
import { PurchaseOrderEntity } from './entities/purchase-order.entity';
import { ProcurementController } from './procurement.controller';
import { ProcurementService } from './procurement.service';

@Module({
  imports: [TypeOrmModule.forFeature([VendorEntity, PurchaseOrderEntity])],
  controllers: [ProcurementController],
  providers: [ProcurementService],
  exports: [ProcurementService],
})
export class ProcurementModule {}
