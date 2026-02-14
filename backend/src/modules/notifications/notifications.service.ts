import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  async findAll(tenantId: string, userId?: string): Promise<NotificationEntity[]> {
    const qb = this.repo.createQueryBuilder('n')
      .where('n.tenantId = :tenantId', { tenantId })
      .orderBy('n.createdAt', 'DESC')
      .take(50);
    if (userId) {
      qb.andWhere('(n.userId = :userId OR n.userId IS NULL)', { userId });
    }
    return qb.getMany();
  }

  async create(data: Partial<NotificationEntity>): Promise<NotificationEntity> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async markRead(tenantId: string, id: string): Promise<void> {
    await this.repo.update({ id, tenantId }, { isRead: true });
  }

  async markAllRead(tenantId: string, userId: string): Promise<void> {
    await this.repo.createQueryBuilder()
      .update(NotificationEntity)
      .set({ isRead: true })
      .where('tenant_id = :tenantId', { tenantId })
      .andWhere('(user_id = :userId OR user_id IS NULL)', { userId })
      .andWhere('is_read = false')
      .execute();
  }

  async dismiss(tenantId: string, id: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  async unreadCount(tenantId: string, userId: string): Promise<number> {
    return this.repo.createQueryBuilder('n')
      .where('n.tenantId = :tenantId', { tenantId })
      .andWhere('(n.userId = :userId OR n.userId IS NULL)', { userId })
      .andWhere('n.isRead = false')
      .getCount();
  }
}
