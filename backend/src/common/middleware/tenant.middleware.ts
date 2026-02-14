import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // Tenant can come from:
    // 1. JWT payload (set by auth guard)
    // 2. X-Tenant-ID header (for system admin acting on behalf)
    // 3. Subdomain (e.g., acme.erp.example.com)

    const headerTenant = req.headers['x-tenant-id'] as string | undefined;
    const user = (req as any).user;

    if (user?.tenantId) {
      req.tenantId = user.tenantId;
    } else if (headerTenant) {
      req.tenantId = headerTenant;
    } else {
      // Extract from subdomain
      const host = req.hostname;
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'localhost' && subdomain !== 'api') {
        // Will resolve tenant ID from slug in a real implementation
        req.tenantId = subdomain;
      }
    }

    // Public routes (login, register, health) don't require tenant
    const publicPaths = ['/api/v1/auth', '/api/v1/health', '/api/docs'];
    const isPublic = publicPaths.some((p) => req.path.startsWith(p));

    if (!isPublic && !req.tenantId && !user?.isSystemAdmin) {
      throw new BadRequestException('Tenant context is required');
    }

    next();
  }
}
