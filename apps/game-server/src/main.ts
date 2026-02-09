import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(cookieParser());

  const origin = config.get<string>('CORS_ORIGIN');

  app.enableCors({
    origin: origin ?? undefined,
    credentials: true,
  });

  const port = Number(config.get('PORT') ?? 4001);
  await app.listen(port);
  console.log(`game-server listening on :${port}`);
}
bootstrap().catch((err) => {
  console.log('Failed to start game-server', err);
  process.exit(1);
});
