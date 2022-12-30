import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { logInfo } from 'src/provides/log.provide';
import { ReportCrawService } from 'src/modules/report-craw/services/report-craw.service';

@Injectable()
export class ScheduleService {

  @Cron('30 7 * * *')
  async getDataIntoReport() {
    logInfo('Run cron get data craw everyday');
    const reportCraw = new ReportCrawService();
    await reportCraw.getDataIntoReport(null, null);
    logInfo('Run cron get data craw everyday - done');
  }
}
