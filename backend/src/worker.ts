import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  console.log('🔧 Worker process started — listening for background jobs');
  // The app context keeps BullMQ processors, event listeners, and cron jobs alive
}

bootstrap();
