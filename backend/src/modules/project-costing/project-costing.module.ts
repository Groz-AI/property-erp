import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WbsEntity } from './entities/wbs.entity';
import { ProjectCostingController } from './project-costing.controller';
import { ProjectCostingService } from './project-costing.service';

@Module({
  imports: [TypeOrmModule.forFeature([WbsEntity])],
  controllers: [ProjectCostingController],
  providers: [ProjectCostingService],
  exports: [ProjectCostingService],
})
export class ProjectCostingModule {}
