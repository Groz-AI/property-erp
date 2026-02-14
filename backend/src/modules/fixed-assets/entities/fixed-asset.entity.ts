import { Entity, Column } from 'typeorm';
import { BaseVersionedEntity } from '../../../shared/entities/base.entity';

@Entity('fixed_assets')
export class FixedAssetEntity extends BaseVersionedEntity {
  @Column({ name: 'asset_code', type: 'varchar', length: 50, unique: true })
  assetCode: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;

  @Column({ name: 'company_id', type: 'uuid' })
  companyId: string;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId: string | null;

  @Column({ name: 'purchase_date', type: 'date' })
  purchaseDate: Date;

  @Column({ name: 'purchase_cost', type: 'numeric', precision: 15, scale: 2 })
  purchaseCost: number;

  @Column({ name: 'salvage_value', type: 'numeric', precision: 15, scale: 2, default: 0 })
  salvageValue: number;

  @Column({ name: 'useful_life_months', type: 'int' })
  usefulLifeMonths: number;

  @Column({ name: 'depreciation_method', type: 'varchar', length: 30, default: 'straight_line' })
  depreciationMethod: string;

  @Column({ name: 'accumulated_depreciation', type: 'numeric', precision: 15, scale: 2, default: 0 })
  accumulatedDepreciation: number;

  @Column({ name: 'net_book_value', type: 'numeric', precision: 15, scale: 2, default: 0 })
  netBookValue: number;

  @Column({ type: 'varchar', length: 3, default: 'AED' })
  currency: string;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status: string;

  @Column({ name: 'disposed_at', type: 'timestamptz', nullable: true })
  disposedAt: Date | null;

  @Column({ name: 'disposal_amount', type: 'numeric', precision: 15, scale: 2, nullable: true })
  disposalAmount: number | null;
}
