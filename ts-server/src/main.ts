import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config';
import { CORS_SITE } from './constants';
import { LogService } from './provides/log.service';
import MongoDb from './utils/mongodb';
import { validationError } from './utils/validator';
import { IntervalService } from 'src/modules/interval/services';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LogService(),
  });

  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: validationError,
  }));
  // app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors(CORS_SITE);
  await app.listen(config.PORT);
  console.log(`start app: http://localhost:${config.PORT}`);
  await MongoDb.connect();

  // RUN interval process service
  // can run command: node dist/commander interval
  if (config.RUN_INTERVAL == '1') {
    try {
      const intervalService = new IntervalService();
      intervalService.runMain();
    } catch (err) {
      console.log('Error interval', err);
    }
  }
}

// cleanup funciton to close connection
const cleanup = async (event) => {
  console.log("event to close: ", event);
  await MongoDb.close();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

bootstrap();

