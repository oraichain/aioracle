import {MONGO} from '../../constants';
import MongoDb from 'src/utils/mongodb';

export default class BaseRepository {
  private dbInstance;
  protected requestCollections;
  protected merkleCollection;
  protected executorCollection;

  public async db (contractAddr : string) {
    this.dbInstance = await MongoDb.instance(contractAddr);
    this.requestCollections = this.dbInstance.collection(MONGO.REQUESTS_COLLECTION);
    this.merkleCollection = this.dbInstance.collection(MONGO.MERKLE_ROOTS_COLLECTION);
    this.executorCollection = this.dbInstance.collection(MONGO.EXECUTORS_COLLECTION);
  }
}