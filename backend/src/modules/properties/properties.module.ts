import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './entities/project.entity';
import { UnitEntity } from './entities/unit.entity';
import { ProjectsController } from './controllers/projects.controller';
import { UnitsController } from './controllers/units.controller';
import { ProjectsService } from './services/projects.service';
import { UnitsService } from './services/units.service';
import { UnitStateMachineService } from './services/unit-state-machine.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity, UnitEntity])],
  controllers: [ProjectsController, UnitsController],
  providers: [ProjectsService, UnitsService, UnitStateMachineService],
  exports: [ProjectsService, UnitsService, UnitStateMachineService],
})
export class PropertiesModule {}
