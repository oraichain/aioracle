import AppDataSource from 'src/config/datasource';
import { CollectionSimilar } from '../entities';

export const CollectionSimilarRepository = AppDataSource.getRepository(CollectionSimilar).extend({});
