import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChartOfAccountEntity } from './entities/chart-of-account.entity';
import { JournalEntryEntity } from './entities/journal-entry.entity';
import { AccountingRuleEntity } from './entities/accounting-rule.entity';
import { AccountingRulesEngineService } from './services/accounting-rules-engine.service';
import { AccountingController } from './accounting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ChartOfAccountEntity, JournalEntryEntity, AccountingRuleEntity])],
  controllers: [AccountingController],
  providers: [AccountingRulesEngineService],
  exports: [AccountingRulesEngineService],
})
export class AccountingModule {}
