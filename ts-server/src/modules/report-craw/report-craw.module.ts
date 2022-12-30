import { Module } from '@nestjs/common';
import { ReportCrawController } from './controllers/report-craw.controller';
import { ReportCrawService } from './services/report-craw.service';

@Module({
  controllers: [ReportCrawController],
  providers: [ReportCrawService],
})
export class ReportCrawModule {}