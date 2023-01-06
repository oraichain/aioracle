import { Module } from '@nestjs/common';
import { ExecutorService } from './services';
import { HomeController,
  ExecutorController,
  ReportController,
  ProofController,
  TestnetController
} from './controllers';

@Module({
  controllers: [
    HomeController,
    ExecutorController,
    ReportController,
    ProofController,
    TestnetController
  ],
  providers: [
    ExecutorService
  ],
  imports: [],
})
export class ExecutorModule {}
