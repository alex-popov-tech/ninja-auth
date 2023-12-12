import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: [
      'log',
      'fatal',
      'error',
      'warn',
      isProduction ? 'verbose' : 'debug',
    ],
  });
  await app.listen(3000);
}
bootstrap();
