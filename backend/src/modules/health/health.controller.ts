import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/tenant.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }
}
