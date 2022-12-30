import AppDataSource from 'src/config/datasource';
import { ReportDaily } from '../entities';

export const ReportDailyRepository = AppDataSource.getRepository(
  ReportDaily,
).extend({});
