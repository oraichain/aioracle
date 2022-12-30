import config from '../config';
import { MongoClient } from 'mongodb';

export class MongoDB {
  static client = null;
  static db = null;

  static async instance() {
    if (MongoDB.db) {
      return MongoDB.db;
    }
    MongoDB.client = new MongoClient(config.MONGODB_URL);
    await MongoDB.client.connect();
    MongoDB.db = MongoDB.client.db(config.MONGODB_DB_NAME);
    return MongoDB.db;
  }

  static async collection(coll=null) {
    if (!coll) {
      coll = COLLECTIONS.NFT;
    }
    await MongoDB.instance();
    return MongoDB.db.collection(coll);
  }

  static async close() {
    await MongoDB.client.close();
  }
}

export const COLLECTIONS = {
  NFT: 'nft'
};
