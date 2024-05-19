import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { runDbMigrations } from '@shared/utils';

const port = process.env.PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await runDbMigrations();

  await app.listen(port);
}
bootstrap();
