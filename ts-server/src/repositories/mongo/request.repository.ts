import BaseRepository from './base.repository';

export class RequestRepository extends BaseRepository {

  async insertRequest (requestId, threshold) {
    const filter = { _id: requestId, requestId };
    // add unique report to the list of reports
    const updateDoc = {
      $setOnInsert: {
        _id: requestId,
        requestId,
        threshold
      }
    }
    // upsert means if does not exist then create document
    return await this.requestCollections.updateOne(filter, updateDoc, { upsert: true });
  }
}
