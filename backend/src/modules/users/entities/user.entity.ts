import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId: string | null;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'first_name_ar', type: 'varchar', length: 100, nullable: true })
  firstNameAr: string | null;

  @Column({ name: 'last_name_ar', type: 'varchar', length: 100, nullable: true })
  lastNameAr: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'preferred_language', type: 'varchar', length: 5, default: 'en' })
  preferredLanguage: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_system_admin', type: 'boolean', default: false })
  isSystemAdmin: boolean;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @Column({ name: 'last_login_ip', type: 'varchar', length: 45, nullable: true })
  lastLoginIp: string | null;

  @Column({ name: 'failed_login_count', type: 'int', default: 0 })
  failedLoginCount: number;

  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  lockedUntil: Date | null;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 255, nullable: true })
  refreshTokenHash: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
