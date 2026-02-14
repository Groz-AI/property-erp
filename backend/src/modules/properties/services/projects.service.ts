import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from '../entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly repo: Repository<ProjectEntity>,
  ) {}

  async findAll(tenantId: string): Promise<ProjectEntity[]> {
    return this.repo.find({
      where: { tenantId },
      relations: ['company', 'branch'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<ProjectEntity> {
    const entity = await this.repo.findOne({
      where: { id, tenantId },
      relations: ['company', 'branch'],
    });
    if (!entity) throw new NotFoundException('Project not found');
    return entity;
  }

  async create(tenantId: string, data: Partial<ProjectEntity>, userId: string): Promise<ProjectEntity> {
    const entity = this.repo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId });
    return this.repo.save(entity);
  }

  async update(tenantId: string, id: string, data: Partial<ProjectEntity>, userId: string): Promise<ProjectEntity> {
    const entity = await this.findOne(tenantId, id);
    Object.assign(entity, data, { updatedBy: userId });
    return this.repo.save(entity);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const entity = await this.findOne(tenantId, id);
    await this.repo.softRemove(entity);
  }
}
