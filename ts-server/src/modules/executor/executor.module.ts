import { Module } from '@nestjs/common';
import { ExecutorService } from './services';
import { HomeController, ExecutorController } from './controllers';

@Module({
  controllers: [
    HomeController,
    ExecutorController
  ],
  providers: [
    ExecutorService
  ],
  imports: [],
})
export class ExecutorModule {}
