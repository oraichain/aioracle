import BaseRepository from './base.repository';

export class ExecutorRepository extends BaseRepository {

  /**
   * danh sach co phan trang tat ca request cua 1 executor
   *
   * @param executor int
   * @param pagerNumber object
   * @returns 
   */
  async findExecutorReports (executor, pagerNumber) {
    const query = { executor };
    const count = await this.executorCollection.countDocuments(query);
    const data = this.executorCollection
      .find(query)
      .sort({requestId: -1})
      .skip(pagerNumber.skip)
      .limit(pagerNumber.limit);
    return { data: await data.toArray(), count };
  }

  /**
   * danh sach co phan trang tat ca request
   *   da thanh cong cua 1 executor
   *
   * TODO // phan trang dang khong hop ly
   * phan trang mongo xong moi filter tiep -> ko du so luong
   * dang lay het executor -> chi phan trang cho phan request?
   */
  async findFinishedExecutorReports (executor, pagerNumber) {
    // find a list of reports that has the given executor & request id in the list of submitted request id. Note that the claim field must be false
    let executorResults = await this.executorCollection
      .find({ executor, $or: [{ claimed: null }, { claimed: false }] })
      .sort({ requestId: -1 })
      .toArray();
    let requestIds = executorResults.map(res => res.requestId);
    let requestResults = await this.requestCollections
      .find({ "submitted": true, _id: { $in: requestIds } })
      .sort({ _id: -1 })
      .skip(pagerNumber.skip)
      .limit(pagerNumber.limit)
      .toArray();
    return executorResults.filter(
      result => requestResults.find(
        reqResult => result.requestId === reqResult.requestId
      )
    );
  }

  /**
   * update cac cap executor - request: ATTR `claimed` -> true
   *
   * @param executorsData array obj
   */
  async bulkUpdateExecutorReports (executorsData) {
    // update the requests that have been handled in the database
    let bulkUpdateOps = [];
    for (let { executor, request_id: requestId } of executorsData) {
      bulkUpdateOps.push({
        "updateOne": {
          "filter": { executor, requestId },
          "update": { "$set": { "claimed": true } }
        }
      })
    }
    if (bulkUpdateOps.length === 0) {
      return false;
    }
    const bulkResult = await this.executorCollection.bulkWrite(bulkUpdateOps);
    return bulkResult?.result?.nMatched;
  }

  /**
   * Tim cap executor request da co report
   *
   * @param requestId int
   * @param executor string
   * @returns 
   */
  async findReport (requestId: number, executor: string) {
    const query = { _id: `${requestId}-${executor}` };
    const result = await this.executorCollection
      .findOne(query, { projection: { _id: 0 } });
    if (result && result.report) {
      return result.report;
    }
    return null;
  }

  /**
   * Danh sach co phan trang cac request
   * 
   * @param requestId 
   * @param pagerNumber 
   * @returns 
   */
  async findReports (requestId: number, pagerNumber) {
    const query = { requestId };
    const count = await this.executorCollection.countDocuments(query);
    const data = await this.executorCollection
      .find(query, { projection: { _id: 0 } })
      .skip(pagerNumber.skip)
      .limit(pagerNumber.limit)
      .toArray();
    return { data, count };
  }
}
