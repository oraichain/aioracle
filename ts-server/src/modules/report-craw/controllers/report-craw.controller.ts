import { Controller, Get, Query} from '@nestjs/common';
import { REPORT_TYPE } from 'src/constants';
import { ReportCrawService } from '../services/report-craw.service';
import { numberWithCommas } from 'src/utils/app.common';

@Controller('report/craw')
export class ReportCrawController {
  constructor(private reportCrawService: ReportCrawService) {}

  @Get()
  async index(@Query() query: any) {
    const reports = await this.reportCrawService.findByTotalDate(query.from, query.to);
    var html = '';
    html += `<h1>Date: from ${reports['date'].from} --> to: ${reports['date'].to}</h1>`;
    var sum = 0;
    for (const [i, typeObj] of Object.entries(reports['total'])) {
      const typeFlagId = parseInt(i);
      switch (typeFlagId) {
        case REPORT_TYPE.CHAIN:
          html += '<h3>Chain</h3>';
          break;
          case REPORT_TYPE.MARKET:
            html += '<h3>Market</h3>';
            break;
          default:
            html += `<h3>${typeFlagId}</h3>`;
            break;
      }
      for (const [typeId, typeItem] of Object.entries(typeObj)) {
        html += `-- ${typeItem.name}: ${numberWithCommas(typeItem.count)}<br/>`;
        if (typeFlagId == REPORT_TYPE.CHAIN) {
          sum += typeItem.count;
        }
      }
    }
    html += `<h2>Sum NFT: ${numberWithCommas(sum)}</h2>`;
    return html;
  }

  @Get('get-data-into-report')
  async getDataIntoReport(@Query() query: any) {
    return await this.reportCrawService.getDataIntoReport(query.from, query.to);
  }

  @Get('date')
  async byEachDate(@Query() query: any) {
    const reports = await this.reportCrawService.findByEachDate(query.from, query.to);
    var html = '';
    for (const [date, itemTypes] of Object.entries(reports)) {
      html += `<h2>Date: ${date}</h2>`;
      for (const [typeId, itemsName] of Object.entries(itemTypes)) {
        for (const [name, count] of Object.entries(itemsName)) {
          html += `-- ${name}: ${numberWithCommas(count)}<br/>`;
        }
      }

    }
    return html;
  }
}
