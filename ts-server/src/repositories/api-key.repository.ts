import AppDataSource from 'src/config/datasource';
import { ApiKey } from '../entities';

export const ApiKeyRepository = AppDataSource.getRepository(ApiKey).extend({});
