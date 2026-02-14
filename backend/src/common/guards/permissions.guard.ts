import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/tenant.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No user context');
    }

    // System admin bypasses all permission checks
    if (user.isSystemAdmin) {
      return true;
    }

    // User permissions are loaded from their roles (cached in JWT or fetched)
    const userPermissions: string[] = user.permissions || [];

    // Check if user has wildcard permission
    if (userPermissions.includes('*')) {
      return true;
    }

    const hasPermission = requiredPermissions.some((perm) => {
      // Exact match
      if (userPermissions.includes(perm)) return true;
      // Wildcard match: 'units:*' matches 'units:read'
      const [module] = perm.split(':');
      if (userPermissions.includes(`${module}:*`)) return true;
      return false;
    });

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
