import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorEntity } from './entities/vendor.entity';
import { PurchaseOrderEntity } from './entities/purchase-order.entity';
import { POStatus } from '../../shared/enums';

@Injectable()
export class ProcurementService {
  constructor(
    @InjectRepository(VendorEntity)
    private readonly vendorRepo: Repository<VendorEntity>,
    @InjectRepository(PurchaseOrderEntity)
    private readonly poRepo: Repository<PurchaseOrderEntity>,
  ) {}

  // Vendors
  async findAllVendors(tenantId: string): Promise<VendorEntity[]> {
    return this.vendorRepo.find({ where: { tenantId }, order: { name: 'ASC' } });
  }

  async findOneVendor(tenantId: string, id: string): Promise<VendorEntity> {
    const e = await this.vendorRepo.findOne({ where: { id, tenantId } });
    if (!e) throw new NotFoundException('Vendor not found');
    return e;
  }

  async createVendor(tenantId: string, data: Partial<VendorEntity>, userId: string): Promise<VendorEntity> {
    return this.vendorRepo.save(this.vendorRepo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId }));
  }

  async updateVendor(tenantId: string, id: string, data: Partial<VendorEntity>, userId: string): Promise<VendorEntity> {
    const e = await this.findOneVendor(tenantId, id);
    Object.assign(e, data, { updatedBy: userId });
    return this.vendorRepo.save(e);
  }

  // Purchase Orders
  async findAllPOs(tenantId: string, filters?: { status?: POStatus; vendorId?: string }): Promise<PurchaseOrderEntity[]> {
    const qb = this.poRepo.createQueryBuilder('po')
      .leftJoinAndSelect('po.vendor', 'vendor')
      .where('po.tenantId = :tenantId', { tenantId });
    if (filters?.status) qb.andWhere('po.status = :status', { status: filters.status });
    if (filters?.vendorId) qb.andWhere('po.vendorId = :vendorId', { vendorId: filters.vendorId });
    return qb.orderBy('po.createdAt', 'DESC').getMany();
  }

  async findOnePO(tenantId: string, id: string): Promise<PurchaseOrderEntity> {
    const e = await this.poRepo.findOne({ where: { id, tenantId }, relations: ['vendor'] });
    if (!e) throw new NotFoundException('Purchase order not found');
    return e;
  }

  async createPO(tenantId: string, data: Partial<PurchaseOrderEntity>, userId: string): Promise<PurchaseOrderEntity> {
    return this.poRepo.save(this.poRepo.create({ ...data, tenantId, createdBy: userId, updatedBy: userId }));
  }

  async updatePO(tenantId: string, id: string, data: Partial<PurchaseOrderEntity>, userId: string): Promise<PurchaseOrderEntity> {
    const e = await this.findOnePO(tenantId, id);
    Object.assign(e, data, { updatedBy: userId });
    return this.poRepo.save(e);
  }
}
