import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ExecutorModule } from 'src/modules/executor/executor.module';
import { HttpExceptionFilter } from './exception';

@Module({
  imports: [
    ExecutorModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
