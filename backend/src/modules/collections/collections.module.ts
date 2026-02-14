import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptEntity } from './entities/receipt.entity';
import { InstallmentEntity } from '../installments/entities/installment.entity';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReceiptEntity, InstallmentEntity])],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
