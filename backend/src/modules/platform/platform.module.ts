import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from '../tenants/entities/tenant.entity';
import { UserEntity } from '../users/entities/user.entity';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity, UserEntity])],
  controllers: [PlatformController],
  providers: [PlatformService],
})
export class PlatformModule {}
