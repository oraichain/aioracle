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

  async findUnsubmittedRequests () {
    return await this.requestCollections.find({
      submitted: null,
      threshold: { $ne: null } 
    })
      .limit(10)
      .sort({ _id: -1, requestId: -1 })
      .toArray();
  }
}
