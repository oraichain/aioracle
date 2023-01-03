import { Module } from '@nestjs/common';
import { ExecutorService } from './services';
import { HomeController,
  ExecutorController,
  ReportController
} from './controllers';

@Module({
  controllers: [
    HomeController,
    ExecutorController,
    ReportController
  ],
  providers: [
    ExecutorService
  ],
  imports: [],
})
export class ExecutorModule {}
