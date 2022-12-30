import BaseRepository from './base.repository';

export class ExecutorRepository extends BaseRepository {
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
}
