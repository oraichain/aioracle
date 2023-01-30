import BaseRepository from './base.repository';
import { Executor } from 'src/entities/mongo';
import { PagerNumberDto } from 'src/dtos';

export class ExecutorRepository extends BaseRepository {

  /**
   * danh sach co phan trang tat ca request cua 1 executor
   *
   * @param executor string
   * @param pagerNumber object
   * @returns 
   */
  async findExecutorReports (executor: string, pagerNumber: PagerNumberDto) {
    const query = { executor };
    const count = await this.executorCollection.countDocuments(query);
    const data = await this.executorCollection
      .find(query)
      .sort({requestId: -1})
      .skip(pagerNumber.skip)
      .limit(pagerNumber.limit)
      .toArray();
    return { data: data, count };
  }

  /**
   * danh sach co phan trang tat ca request
   *   da thanh cong cua 1 executor
   *
   * Hien tai dang khong dung, cai claim nay ngay trc lam de claim rewards
   * ap dung vo cung phuc tap ma chua can thiet
   */
  async findFinishedExecutorReports (executor: string, pagerNumber: PagerNumberDto) {
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
  async findReports (requestId: number, pagerNumber: PagerNumberDto) {
    const query = { requestId };
    const count = await this.executorCollection.countDocuments(query);
    const data = await this.executorCollection
      .find(query, { projection: { _id: 0 } })
      .skip(pagerNumber.skip)
      .limit(pagerNumber.limit)
      .toArray();
    return { data, count };
  }

  /**
   * count so luong executor co request id
   * 
   * @param requestId int
   * @returns 
   */
  async countExecutorReports (requestId: number) {
    return await this.executorCollection.countDocuments({ requestId });
  }

  async insertExecutorReport (requestId: number, executor: string, report: any) {
    // request ID + executor should be unique
    const insertObj = {
      _id: `${requestId}-${executor}`, // force the executor report to be unique
      requestId,
      executor,
      report,
      claimed: false,
    }
    return await this.executorCollection.insertOne(insertObj);
  }

  async queryExecutorReportsWithThreshold (requestId: number, threshold: number) {
    return await this.executorCollection.find({ requestId })
      .limit(threshold > this.MAX_LIMIT ? this.MAX_LIMIT : threshold)
      .toArray();
  }

  async updateReportsStatus (requestId: number) {
    const filter = { _id: requestId, requestId };
    const updateDoc = {
        $set: {
            submitted: true
        },
    };
    return await this.requestCollections.updateOne(filter, updateDoc);
  }

  async updateReports (requestId: number, numRedundant: number) {
    const reportsResult = await this.queryExecutorReportsWithThreshold(
      requestId,
      numRedundant
    );
    const ids = reportsResult.map(result => result._id);
    return await this.executorCollection
      .deleteMany({ _id: { $in: ids } });
  }
}
