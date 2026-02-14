import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { AccountType } from '../../../shared/enums';

@Entity('chart_of_accounts')
export class ChartOfAccountEntity extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 20 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'name_ar', type: 'varchar', length: 255, nullable: true })
  nameAr: string | null;

  @Column({ type: 'enum', enum: AccountType })
  type: AccountType;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ name: 'is_header', type: 'boolean', default: false })
  isHeader: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'normal_balance', type: 'varchar', length: 10, default: 'debit' })
  normalBalance: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ManyToOne(() => ChartOfAccountEntity)
  @JoinColumn({ name: 'parent_id' })
  parent: ChartOfAccountEntity | null;
}
