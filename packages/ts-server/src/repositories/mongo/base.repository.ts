import { Db, Collection } from 'mongodb';
import {MONGO} from '../../constants';
import MongoDb from 'src/utils/mongodb';
import { Executor, Request, MerkleRoot } from '../../entities/mongo';

export default class BaseRepository {
  private dbInstance: Db;
  protected requestCollections: Collection<Request>;
  protected merkleCollection: Collection<MerkleRoot>;
  protected executorCollection: Collection<Executor>;
  protected readonly MAX_LIMIT = 20;

  public async db (contractAddr : string, isSetDefault=true) {
    this.dbInstance = await MongoDb.instance(contractAddr);
    if (isSetDefault) {
      this.requestCollections = this.dbInstance.collection<Request>(MONGO.REQUESTS_COLLECTION);
      this.merkleCollection = this.dbInstance.collection<MerkleRoot>(MONGO.MERKLE_ROOTS_COLLECTION);
      this.executorCollection = this.dbInstance.collection<Executor>(MONGO.EXECUTORS_COLLECTION);
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
    await this.dbInstance.createIndex(MONGO.REQUESTS_COLLECTION, { "submitted": -1 });
  }

  async indexExecutorReport () {
    await this.dbInstance.createIndex(MONGO.EXECUTORS_COLLECTION, { "executor": -1, "requestId": -1 })
    await this.dbInstance.createIndex(MONGO.EXECUTORS_COLLECTION, { "requestId": -1 })
    await this.dbInstance.createIndex(MONGO.EXECUTORS_COLLECTION, { "executor": -1, "claimed": -1 })
  }
}
