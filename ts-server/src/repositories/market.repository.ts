import AppDataSource from "src/config/datasource";
import { Market } from '../entities';

export const MarketRepository = AppDataSource.getRepository(Market).extend({});
