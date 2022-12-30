import * as moment from "moment";
import { MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import AppDataSource from "src/config/datasource";
import { ReportCrawChainMarket } from '../entities';

export const ReportCrawChainMarketRepository = AppDataSource.getRepository(ReportCrawChainMarket).extend({
    findByDate(from, to): Promise<ReportCrawChainMarket[]> {
        const whereObj = {};
        if (!from && !to) {
            whereObj['date'] = moment().format('YYYY-MM-DD');
        }
        if (from) {
            whereObj['date'] = MoreThanOrEqual(from);
        }
        if (to) {
            whereObj['date'] = LessThanOrEqual(to);
        }

        return this.find({
            where: whereObj
        });
    },
});
