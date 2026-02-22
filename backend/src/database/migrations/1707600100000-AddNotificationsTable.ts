import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationsTable1707600100000 implements MigrationInterface {
  name = 'AddNotificationsTable1707600100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "user_id" uuid,
        "type" varchar(50) NOT NULL,
        "title" varchar(255) NOT NULL,
        "message" text,
        "reference_type" varchar(50),
        "reference_id" uuid,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`CREATE INDEX "IDX_notifications_tenant" ON "notifications" ("tenant_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user" ON "notifications" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_read" ON "notifications" ("tenant_id", "user_id", "is_read")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notifications_read"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notifications_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notifications_tenant"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
  }
}
