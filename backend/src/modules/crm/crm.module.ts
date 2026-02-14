import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadEntity } from './entities/lead.entity';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';

@Module({
  imports: [TypeOrmModule.forFeature([LeadEntity])],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
