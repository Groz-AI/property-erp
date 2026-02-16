import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TenantEntity } from '../tenants/entities/tenant.entity';
import { UserEntity } from '../users/entities/user.entity';

export interface CreateTenantDto {
  name: string;
  slug: string;
  domain?: string;
  maxUsers?: number;
  adminEmail: string;
  adminPassword: string;
  adminFirstName: string;
  adminLastName: string;
  settings?: Record<string, any>;
}

export interface TenantWithStats extends TenantEntity {
  usersCount: number;
  activeUsersCount: number;
  projectsCount: number;
  bookingsCount: number;
  unitsCount: number;
  revenue: number;
}

@Injectable()
export class PlatformService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async listTenants(): Promise<TenantWithStats[]> {
    const tenants = await this.tenantRepo.find({ order: { createdAt: 'DESC' } });

    const stats = await Promise.all(
      tenants.map(async (t) => {
        const [userStats] = await this.userRepo.query(
          `SELECT 
            COUNT(*)::int AS "usersCount",
            COUNT(*) FILTER (WHERE is_active = true)::int AS "activeUsersCount"
          FROM users WHERE tenant_id = $1 AND deleted_at IS NULL`,
          [t.id],
        );

        const [entityStats] = await this.dataSource.query(
          `SELECT
            (SELECT COUNT(*)::int FROM projects WHERE tenant_id = $1) AS "projectsCount",
            (SELECT COUNT(*)::int FROM bookings WHERE tenant_id = $1) AS "bookingsCount",
            (SELECT COUNT(*)::int FROM units WHERE tenant_id = $1) AS "unitsCount",
            (SELECT COALESCE(SUM(amount), 0)::numeric FROM receipts WHERE tenant_id = $1 AND status = 'confirmed') AS "revenue"`,
          [t.id],
        );

        return {
          ...t,
          usersCount: userStats?.usersCount || 0,
          activeUsersCount: userStats?.activeUsersCount || 0,
          projectsCount: entityStats?.projectsCount || 0,
          bookingsCount: entityStats?.bookingsCount || 0,
          unitsCount: entityStats?.unitsCount || 0,
          revenue: Number(entityStats?.revenue) || 0,
        };
      }),
    );

    return stats;
  }

  async getTenant(id: string): Promise<TenantWithStats> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const [userStats] = await this.userRepo.query(
      `SELECT 
        COUNT(*)::int AS "usersCount",
        COUNT(*) FILTER (WHERE is_active = true)::int AS "activeUsersCount"
      FROM users WHERE tenant_id = $1 AND deleted_at IS NULL`,
      [id],
    );

    const [entityStats] = await this.dataSource.query(
      `SELECT
        (SELECT COUNT(*)::int FROM projects WHERE tenant_id = $1) AS "projectsCount",
        (SELECT COUNT(*)::int FROM bookings WHERE tenant_id = $1) AS "bookingsCount",
        (SELECT COUNT(*)::int FROM units WHERE tenant_id = $1) AS "unitsCount",
        (SELECT COALESCE(SUM(amount), 0)::numeric FROM receipts WHERE tenant_id = $1 AND status = 'confirmed') AS "revenue"`,
      [id],
    );

    return {
      ...tenant,
      usersCount: userStats?.usersCount || 0,
      activeUsersCount: userStats?.activeUsersCount || 0,
      projectsCount: entityStats?.projectsCount || 0,
      bookingsCount: entityStats?.bookingsCount || 0,
      unitsCount: entityStats?.unitsCount || 0,
      revenue: Number(entityStats?.revenue) || 0,
    };
  }

  async createTenant(dto: CreateTenantDto): Promise<TenantWithStats> {
    // Check slug uniqueness
    const existing = await this.tenantRepo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Tenant slug already exists');

    // Check admin email uniqueness
    const existingUser = await this.userRepo.findOne({ where: { email: dto.adminEmail.toLowerCase() } });
    if (existingUser) throw new ConflictException('Admin email already exists');

    return this.dataSource.transaction(async (manager) => {
      // 1. Create tenant
      const tenant = manager.create(TenantEntity, {
        name: dto.name,
        slug: dto.slug,
        domain: dto.domain || null,
        maxUsers: dto.maxUsers || 10,
        isActive: true,
        settings: dto.settings || {},
      });
      const savedTenant = await manager.save(TenantEntity, tenant);

      // 2. Create admin user for this tenant
      const passwordHash = await bcrypt.hash(dto.adminPassword, 12);
      const adminUser = manager.create(UserEntity, {
        tenantId: savedTenant.id,
        email: dto.adminEmail.toLowerCase(),
        passwordHash,
        firstName: dto.adminFirstName,
        lastName: dto.adminLastName,
        isActive: true,
        isSystemAdmin: false,
        emailVerified: true,
      });
      await manager.save(UserEntity, adminUser);

      // 3. Create default roles for the tenant
      const defaultRoles = [
        { name: 'Tenant Admin', permissions: ['*'] },
        { name: 'Sales Manager', permissions: ['leads:*', 'opportunities:*', 'bookings:*', 'contracts:*', 'customers:*', 'units:read', 'commissions:*', 'reports:sales'] },
        { name: 'Sales Agent', permissions: ['leads:read', 'leads:create', 'leads:update', 'bookings:create', 'bookings:read', 'customers:create', 'customers:read', 'units:read'] },
        { name: 'Finance Manager', permissions: ['accounting:*', 'receipts:*', 'cheques:*', 'refunds:*', 'contracts:read', 'reports:finance'] },
        { name: 'Accountant', permissions: ['accounting:read', 'accounting:create', 'receipts:*', 'cheques:*', 'reports:finance'] },
      ];

      for (const r of defaultRoles) {
        await manager.query(
          `INSERT INTO roles (tenant_id, name, permissions, is_system) VALUES ($1, $2, $3, true) ON CONFLICT DO NOTHING`,
          [savedTenant.id, r.name, JSON.stringify(r.permissions)],
        );
      }

      // 4. Assign "Tenant Admin" role to the admin user
      await manager.query(
        `INSERT INTO user_roles (user_id, role_id)
         SELECT $1, r.id FROM roles r
         WHERE r.tenant_id = $2 AND r.name = 'Tenant Admin'
         ON CONFLICT DO NOTHING`,
        [adminUser.id, savedTenant.id],
      );

      // 5. Create default chart of accounts
      const defaultCoa = [
        ['1000', 'Assets', 'asset', true],
        ['1100', 'Current Assets', 'asset', true],
        ['1101', 'Cash on Hand', 'asset', false],
        ['1110', 'Bank - Main Account', 'asset', false],
        ['1130', 'Accounts Receivable', 'asset', false],
        ['2000', 'Liabilities', 'liability', true],
        ['2100', 'Current Liabilities', 'liability', true],
        ['2110', 'Accounts Payable', 'liability', false],
        ['2160', 'Customer Deposits', 'liability', false],
        ['3000', 'Equity', 'equity', true],
        ['3100', 'Share Capital', 'equity', false],
        ['4000', 'Revenue', 'revenue', true],
        ['4100', 'Unit Sales Revenue', 'revenue', false],
        ['5000', 'Cost of Sales', 'expense', true],
        ['6000', 'Operating Expenses', 'expense', true],
        ['6110', 'Salaries & Wages', 'expense', false],
      ];

      for (const [code, name, type, isHeader] of defaultCoa) {
        await manager.query(
          `INSERT INTO chart_of_accounts (tenant_id, code, name, type, is_header) VALUES ($1, $2, $3, $4::account_type, $5) ON CONFLICT DO NOTHING`,
          [savedTenant.id, code, name, type, isHeader],
        );
      }

      return {
        ...savedTenant,
        usersCount: 1,
        activeUsersCount: 1,
        projectsCount: 0,
        bookingsCount: 0,
        unitsCount: 0,
        revenue: 0,
      };
    });
  }

  async activateTenant(id: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    tenant.isActive = true;
    return this.tenantRepo.save(tenant);
  }

  async deactivateTenant(id: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    tenant.isActive = false;
    return this.tenantRepo.save(tenant);
  }

  async updateTenant(id: string, data: Partial<Pick<TenantEntity, 'name' | 'domain' | 'maxUsers' | 'settings'>>): Promise<TenantEntity> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const allowed: (keyof typeof data)[] = ['name', 'domain', 'maxUsers', 'settings'];
    for (const key of allowed) {
      if (data[key] !== undefined) (tenant as any)[key] = data[key];
    }

    if (tenant.maxUsers !== undefined && (tenant.maxUsers < 1 || tenant.maxUsers > 10000)) {
      throw new ConflictException('maxUsers must be between 1 and 10,000');
    }

    return this.tenantRepo.save(tenant);
  }

  async getTenantUsers(tenantId: string): Promise<UserEntity[]> {
    return this.userRepo.find({
      where: { tenantId },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'isActive', 'lastLoginAt', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async toggleUserActive(userId: string, isActive: boolean): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = isActive;
    return this.userRepo.save(user);
  }

  async getPlatformStats(): Promise<{
    totalTenants: number;
    activeTenants: number;
    totalUsers: number;
    activeUsers: number;
    totalBookings: number;
    totalRevenue: number;
  }> {
    const [tenantStats] = await this.tenantRepo.query(`
      SELECT
        COUNT(*)::int AS "totalTenants",
        COUNT(*) FILTER (WHERE is_active = true)::int AS "activeTenants"
      FROM tenants
    `);

    const [userStats] = await this.userRepo.query(`
      SELECT
        COUNT(*)::int AS "totalUsers",
        COUNT(*) FILTER (WHERE is_active = true)::int AS "activeUsers"
      FROM users WHERE deleted_at IS NULL AND is_system_admin = false
    `);

    const [bizStats] = await this.dataSource.query(`
      SELECT
        (SELECT COUNT(*)::int FROM bookings) AS "totalBookings",
        (SELECT COALESCE(SUM(amount), 0)::numeric FROM receipts WHERE status = 'confirmed') AS "totalRevenue"
    `);

    return {
      totalTenants: tenantStats?.totalTenants || 0,
      activeTenants: tenantStats?.activeTenants || 0,
      totalUsers: userStats?.totalUsers || 0,
      activeUsers: userStats?.activeUsers || 0,
      totalBookings: bizStats?.totalBookings || 0,
      totalRevenue: Number(bizStats?.totalRevenue) || 0,
    };
  }
}
