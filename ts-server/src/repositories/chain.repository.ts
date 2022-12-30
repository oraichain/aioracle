import AppDataSource from "src/config/datasource";
import { Chain } from '../entities';

export const ChainRepository = AppDataSource.getRepository(Chain).extend({});
