import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeEntity } from './entities/employee.entity';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeEntity])],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}
