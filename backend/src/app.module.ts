import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { BranchesModule } from './modules/branches/branches.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuditModule } from './modules/audit/audit.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { MasterDataModule } from './modules/master-data/master-data.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { CrmModule } from './modules/crm/crm.module';
import { BrokersModule } from './modules/brokers/brokers.module';
import { CustomersModule } from './modules/customers/customers.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { InstallmentsModule } from './modules/installments/installments.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { RefundsModule } from './modules/refunds/refunds.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { CashBankModule } from './modules/cash-bank/cash-bank.module';
import { AccountsPayableModule } from './modules/accounts-payable/accounts-payable.module';
import { RevenueRecognitionModule } from './modules/revenue-recognition/revenue-recognition.module';
import { FixedAssetsModule } from './modules/fixed-assets/fixed-assets.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProjectCostingModule } from './modules/project-costing/project-costing.module';
import { ContractorsModule } from './modules/contractors/contractors.module';
import { HandoverModule } from './modules/handover/handover.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { HrModule } from './modules/hr/hr.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PlatformModule } from './modules/platform/platform.module';
import { HealthModule } from './modules/health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),

    // Logging
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        level: process.env.LOG_LEVEL || 'info',
      },
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        database: config.get('DB_NAME', 're_erp'),
        username: config.get('DB_USER', 'erp_user'),
        password: config.get('DB_PASSWORD', 'erp_pass'),
        ssl: config.get('DB_SSL', 'false') === 'true',
        autoLoadEntities: true,
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development' ? ['query', 'error'] : ['error'],
        extra: {
          max: config.get<number>('DB_POOL_SIZE', 20),
        },
      }),
    }),

    // Redis / Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Event Emitter (domain events)
    EventEmitterModule.forRoot({ wildcard: true }),

    // Cron Jobs
    ScheduleModule.forRoot(),

    // Platform Core
    HealthModule,
    AuthModule,
    TenantsModule,
    CompaniesModule,
    BranchesModule,
    UsersModule,
    RolesModule,
    AuditModule,
    ApprovalsModule,
    DocumentsModule,
    MasterDataModule,
    NotificationsModule,
    PlatformModule,

    // Property Catalog
    PropertiesModule,
    PricingModule,

    // CRM & Sales
    CrmModule,
    BrokersModule,

    // Contracting
    CustomersModule,
    BookingsModule,
    ContractsModule,

    // Collections
    InstallmentsModule,
    CollectionsModule,
    RefundsModule,

    // Finance
    AccountingModule,
    CashBankModule,
    AccountsPayableModule,
    RevenueRecognitionModule,
    FixedAssetsModule,
    ReportsModule,

    // Procurement & Inventory
    ProcurementModule,
    InventoryModule,

    // Project Costing & Contractors
    ProjectCostingModule,
    ContractorsModule,

    // Handover & After-Sales
    HandoverModule,
    MaintenanceModule,

    // HR & Payroll
    HrModule,
    PayrollModule,
  ],
  providers: [
    // Global guards: JWT auth first, then permissions
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
