import config from '../config';
import { MongoClient } from 'mongodb';

export default class MongoDb {
  static client = null;
  static db = {};

  static async connect() {
    if (!MongoDb.client) {
      MongoDb.client = new MongoClient(config.MONGO_URL);
      await MongoDb.client.connect();
      console.log("Mongodb connected!!!");
    }
  }

  static async instance(db: string) {
    if (MongoDb.db[db]) {
      return MongoDb.db[db];
    }
    await MongoDb.connect();
    MongoDb.db[db] = MongoDb.client.db(db);
    return MongoDb.db[db];
  }

  static async collection(db:string, coll: string) {
    await MongoDb.instance(db);
    return MongoDb.db[db].collection(coll);
  }

  static async close() {
    if (MongoDb.client) {
      await MongoDb.client.close();
    }
    MongoDb.client = null;
    MongoDb.db = {};
  }
}
