import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import {ConfigService} from "@nestjs/config";
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error']
  });

  const config = app.get(ConfigService);
  app.enableCors({
    origin: config.get('WEB_HOST'),
    credentials: true
  });

  await app.listen(config.get<number>('PORT'));
  app.use(compression());
}
bootstrap();
