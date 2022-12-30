import * as moment from "moment";
import { MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import AppDataSource from "src/config/datasource";
import { ReportCraw } from '../entities';

export const ReportCrawRepository = AppDataSource.getRepository(ReportCraw).extend({
    findByDate(from, to): Promise<ReportCraw[]> {
        const whereObj = {};
        if (!from && !to) {
            whereObj['date'] = moment().subtract(1, 'days').format('YYYY-MM-DD');
        } else if (from && to) {
            whereObj['date'] = Between(from, to);
        } else if (from) {
            whereObj['date'] = MoreThanOrEqual(from);
        } else if (to) {
            whereObj['date'] = LessThanOrEqual(to);
        }

        return this.find({
            where: whereObj
        });
    },
});
