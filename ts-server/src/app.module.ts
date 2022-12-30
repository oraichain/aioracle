import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ApiKeyModule } from 'src/modules/api-key/api-key.module';
import { ReportCrawModule } from './modules/report-craw/report-craw.module';
import { ScheduleJobModule } from './modules/schedule-job/schedule-job.module';
import { QueueUIModule } from './modules/queue-ui/queue-ui.module';

@Module({
  imports: [ApiKeyModule, ReportCrawModule, QueueUIModule, ScheduleModule.forRoot(), ScheduleJobModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
