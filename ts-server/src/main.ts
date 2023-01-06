import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import config from './config';
import { LogService } from './provides/log.service';
import MongoDb from './utils/mongodb';
import { validationError } from './utils/validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LogService(),
  });

  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: validationError,
  }));
  // app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(config.PORT);
  console.log(`start app: http://localhost:${config.PORT}`);
  await MongoDb.connect();
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

