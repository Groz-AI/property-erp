import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private eventEmitter: EventEmitter2) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const before = Date.now();
      return next.handle().pipe(
        tap((responseData) => {
          const duration = Date.now() - before;
          this.eventEmitter.emit('audit.log', {
            tenantId: request.tenantId,
            userId: request.user?.id,
            action: method.toLowerCase(),
            entityType: this.extractEntityType(request.path),
            entityId: responseData?.data?.id || request.params?.id,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            duration,
            path: request.path,
          });
        }),
      );
    }

    return next.handle();
  }

  private extractEntityType(path: string): string {
    const parts = path.split('/').filter(Boolean);
    // /api/v1/units/:id → 'units'
    const moduleIndex = parts.findIndex(
      (p) => !['api', 'v1', 'v2'].includes(p),
    );
    return parts[moduleIndex] || 'unknown';
  }
}
