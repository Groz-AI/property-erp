import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { TenantEntity } from '../tenants/entities/tenant.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    @InjectRepository(TenantEntity)
    private readonly tenantRepo: Repository<TenantEntity>,
  ) {}

  async findAll(tenantId: string): Promise<UserEntity[]> {
    return this.repo.find({
      where: { tenantId },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'isActive', 'lastLoginAt', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<UserEntity> {
    const entity = await this.repo.findOne({
      where: { id, tenantId },
      select: ['id', 'email', 'firstName', 'lastName', 'firstNameAr', 'lastNameAr', 'phone', 'avatarUrl', 'preferredLanguage', 'timezone', 'isActive', 'emailVerified', 'lastLoginAt', 'createdAt'],
    });
    if (!entity) throw new NotFoundException('User not found');
    return entity;
  }

  async create(tenantId: string, data: Partial<UserEntity> & { password?: string }): Promise<UserEntity> {
    // Enforce tenant max_users limit
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (tenant) {
      const currentCount = await this.repo.count({ where: { tenantId } });
      if (currentCount >= tenant.maxUsers) {
        throw new ForbiddenException(`User limit reached. This tenant allows a maximum of ${tenant.maxUsers} users. Contact the platform administrator to increase your limit.`);
      }
    }

    if (data.email) {
      const existing = await this.repo.findOne({ where: { email: data.email.toLowerCase() } });
      if (existing) throw new ConflictException('Email already exists');
    }

    const passwordHash = data.password ? await bcrypt.hash(data.password, 12) : undefined;
    const entity = this.repo.create({
      ...data,
      email: data.email?.toLowerCase(),
      passwordHash: passwordHash || '',
      tenantId,
    });
    delete (entity as any).password;
    const saved = await this.repo.save(entity);
    delete (saved as any).passwordHash;
    return saved;
  }

  async update(tenantId: string, id: string, data: Partial<UserEntity> & { password?: string }): Promise<UserEntity> {
    const entity = await this.findOne(tenantId, id);
    if (data.password) {
      (entity as any).passwordHash = await bcrypt.hash(data.password, 12);
      delete data.password;
    }
    Object.assign(entity, data);
    const saved = await this.repo.save(entity);
    delete (saved as any).passwordHash;
    return saved;
  }

  async deactivate(tenantId: string, id: string): Promise<void> {
    const entity = await this.findOne(tenantId, id);
    entity.isActive = false;
    await this.repo.save(entity);
  }
}
