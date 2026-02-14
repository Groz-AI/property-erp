import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly repo: Repository<RoleEntity>,
  ) {}

  async findAll(tenantId: string): Promise<RoleEntity[]> {
    return this.repo.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async findOne(tenantId: string, id: string): Promise<RoleEntity> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    if (!entity) throw new NotFoundException('Role not found');
    return entity;
  }

  async create(tenantId: string, data: Partial<RoleEntity>): Promise<RoleEntity> {
    const entity = this.repo.create({ ...data, tenantId });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, data: Partial<RoleEntity>): Promise<RoleEntity> {
    const entity = await this.findOne(tenantId, id);
    if (entity.isSystem) {
      // Only allow updating permissions on system roles, not deletion
      entity.permissions = data.permissions || entity.permissions;
      entity.description = data.description ?? entity.description;
    } else {
      Object.assign(entity, data);
    }
    return this.repo.save(entity);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const entity = await this.findOne(tenantId, id);
    if (entity.isSystem) throw new Error('Cannot delete system roles');
    await this.repo.remove(entity);
  }
}
