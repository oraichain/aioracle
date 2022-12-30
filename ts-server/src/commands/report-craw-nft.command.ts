import { Command, CommandRunner, Option } from 'nest-commander';
import { ReportCrawService } from 'src/modules/report-craw/services/report-craw.service';

interface ReportCrawCommandOptions {
  from?: string;
  to?: string;
}

@Command({ name: 'report-craw', description: 'Report craw, get data from api AI, save report into db' })
export class ReportCrawCommand implements CommandRunner {
  constructor() {}

  async run(
    passedParam: string[],
    options?: ReportCrawCommandOptions,
  ): Promise<void> {
    console.log('Start get data -- ', options);
    const reportCraw = new ReportCrawService();
    await reportCraw.getDataIntoReport(options.from, options.to);
    console.log('Done get data -- ', options);
  }

  @Option({
    flags: '--from [string]',
    description: 'format Y-m-d, nullable',
  })
  parseFrom(val: string): string {
    return val;
  }

  @Option({
    flags: '--to [string]',
    description: 'format Y-m-d, nullable',
  })
  parseTo(val: string): string {
    return val;
  }
}
