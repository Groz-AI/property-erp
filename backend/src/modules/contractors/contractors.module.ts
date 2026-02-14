import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractorEntity } from './entities/contractor.entity';
import { ProgressClaimEntity } from './entities/progress-claim.entity';
import { ContractorsController } from './contractors.controller';
import { ContractorsService } from './contractors.service';

@Module({
  imports: [TypeOrmModule.forFeature([ContractorEntity, ProgressClaimEntity])],
  controllers: [ContractorsController],
  providers: [ContractorsService],
  exports: [ContractorsService],
})
export class ContractorsModule {}
