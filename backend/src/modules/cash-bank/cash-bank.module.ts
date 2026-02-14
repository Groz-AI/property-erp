import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountEntity } from './entities/bank-account.entity';
import { CashBankController } from './cash-bank.controller';
import { CashBankService } from './cash-bank.service';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccountEntity])],
  controllers: [CashBankController],
  providers: [CashBankService],
  exports: [CashBankService],
})
export class CashBankModule {}
