import {MONGO} from '../../constants';
import MongoDb from 'src/utils/mongodb';

export default class BaseRepository {
  private dbInstance;
  protected requestCollections;
  protected merkleCollection;
  protected executorCollection;
  protected readonly MAX_LIMIT = 20;

  public async db (contractAddr : string, isSetDefault=true) {
    this.dbInstance = await MongoDb.instance(contractAddr);
    if (isSetDefault) {
      this.requestCollections = this.dbInstance.collection(MONGO.REQUESTS_COLLECTION);
      this.merkleCollection = this.dbInstance.collection(MONGO.MERKLE_ROOTS_COLLECTION);
      this.executorCollection = this.dbInstance.collection(MONGO.EXECUTORS_COLLECTION);
    }
  }

  public getDbInstance() {
    return this.dbInstance;
  }

  public async indexData () {
    await this.indexFinishedRequests();
    await this.indexExecutorReport();
    console.log('indexing done!');
  }

  async indexFinishedRequests () {
    const a = await this.dbInstance.createIndex(MONGO.REQUESTS_COLLECTION, { "submitted": -1 });
  }

  async indexExecutorReport () {
    await this.dbInstance.createIndex(MONGO.EXECUTORS_COLLECTION, { "executor": -1, "requestId": -1 })
    await this.dbInstance.createIndex(MONGO.EXECUTORS_COLLECTION, { "requestId": -1 })
    await this.dbInstance.createIndex(MONGO.EXECUTORS_COLLECTION, { "executor": -1, "claimed": -1 })
  }
}
