import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DocumentsService {
  constructor(private readonly dataSource: DataSource) {}

  async findByEntity(tenantId: string, entityType: string, entityId: string) {
    return this.dataSource.query(
      `SELECT * FROM documents WHERE tenant_id = $1 AND entity_type = $2 AND entity_id = $3 ORDER BY created_at DESC`,
      [tenantId, entityType, entityId],
    );
  }

  async create(tenantId: string, data: { entityType: string; entityId: string; fileName: string; fileType: string; fileSize: number; storageKey: string; category?: string }, userId: string) {
    const [doc] = await this.dataSource.query(
      `INSERT INTO documents (tenant_id, entity_type, entity_id, file_name, file_type, file_size, storage_key, category, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [tenantId, data.entityType, data.entityId, data.fileName, data.fileType, data.fileSize, data.storageKey, data.category || null, userId],
    );
    return doc;
  }

  async findOne(tenantId: string, id: string) {
    const [doc] = await this.dataSource.query(`SELECT * FROM documents WHERE id = $1 AND tenant_id = $2`, [id, tenantId]);
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }
}
