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

  async findRequest (requestId) {
    const query = { _id: requestId, requestId, submitted: null };
    return await this.requestCollections.findOne(
      query,
      { projection: { _id: 0 } }
    );
  }

  async findSubmittedRequest (requestId) {
    const query = { _id: requestId, requestId, submitted: true };
    const request = await this.requestCollections.findOne(
      query,
      { projection: { _id: 0 } }
    );
    if (!request) {
      return { reports: null, submitted: null, threshold: null }
    }
    return request;
  }

  async removeRedundantRequests (requestId) {
    const filter = { requestId, submitted: null };
    return await this.requestCollections.deleteMany(filter);
  }

  async bulkUpdateRequests (requestsData, txHash) {
    // update the requests that have been handled in the database
    let bulkUpdateOps = [];
    for (let { requestId, root } of requestsData) {
      bulkUpdateOps.push({
        "updateOne": {
          "filter": { _id: requestId, requestId },
          "update": { "$set": { "txhash": txHash, "submitted": true, "merkleRoot": root } }
        }
      })
    }
    return await this.requestCollections.bulkWrite(bulkUpdateOps);
  }
}
