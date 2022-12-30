import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config';
import { LogService } from './provides/log.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LogService(),
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(config.PORT);
}
bootstrap();
