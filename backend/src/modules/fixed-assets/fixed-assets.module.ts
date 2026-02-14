import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixedAssetEntity } from './entities/fixed-asset.entity';
import { FixedAssetsController } from './fixed-assets.controller';
import { FixedAssetsService } from './fixed-assets.service';

@Module({
  imports: [TypeOrmModule.forFeature([FixedAssetEntity])],
  controllers: [FixedAssetsController],
  providers: [FixedAssetsService],
  exports: [FixedAssetsService],
})
export class FixedAssetsModule {}
