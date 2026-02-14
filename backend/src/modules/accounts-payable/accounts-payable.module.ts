import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApInvoiceEntity } from './entities/ap-invoice.entity';
import { AccountsPayableController } from './accounts-payable.controller';
import { AccountsPayableService } from './accounts-payable.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApInvoiceEntity])],
  controllers: [AccountsPayableController],
  providers: [AccountsPayableService],
  exports: [AccountsPayableService],
})
export class AccountsPayableModule {}
