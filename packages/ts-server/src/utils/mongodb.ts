import config from '../config';
import { Db, MongoClient } from 'mongodb';

export default class MongoDb {
  static client: MongoClient = null;
  static db = {};

  static async connect() {
    if (!MongoDb.client) {
      MongoDb.client = new MongoClient(config.MONGO_URL);
      await MongoDb.client.connect();
      console.log("Mongodb connected!!!");
    }
  }

  static async instance(db: string): Promise<Db> {
    if (MongoDb.db[db]) {
      return MongoDb.db[db];
    }
    await MongoDb.connect();
    MongoDb.db[db] = MongoDb.client.db(db);
    return MongoDb.db[db];
  }

  static async collection(db: string, coll: string) {
    await MongoDb.instance(db);
    return MongoDb.db[db].collection(coll);
  }

  static async close(cb = null) {
    if (MongoDb.client) {
      await MongoDb.client.close();
      console.log("Mongodb closed!!!");
    }
    MongoDb.client = null;
    MongoDb.db = {};
    if (cb) {
      cb();
    }
  }
}
