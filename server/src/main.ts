import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import {ConfigService} from '@nestjs/config';
import {ValidationPipe} from '@nestjs/common';
import * as basicAuth from 'express-basic-auth';
import {NestExpressApplication} from '@nestjs/platform-express';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error'],
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
