import {
  Injectable,
} from '@nestjs/common';
import axios from 'axios';
import { sha256 } from 'js-sha256';
import * as secp256k1 from 'secp256k1';
import config from 'src/config';
import { COMMON } from 'src/constants';
import { ExecutorRepository, RequestRepository } from 'src/repositories/mongo';

@Injectable()
export class IntervalService {
  constructor() {}
  private repoExec: ExecutorRepository;
  private repoRequ: RequestRepository;

  public async runMain() {
    let gasPrices = COMMON.BASE_GAS_PRICES;
    this.repoExec = new ExecutorRepository();
    this.repoRequ = new RequestRepository();
    await this.repoExec.db(config.CONTRACT_ADDRESS);
    await this.repoRequ.db(config.CONTRACT_ADDRESS);
    await this.repoExec.indexData();
    await this.runInterval(gasPrices);
  }

  async runInterval(gasPrices) {
    try {
      console.log("gas prices: ", gasPrices);
      await this.submitReportInterval(gasPrices);
    } catch (error) {
      console.log("error in interval process: ", error);
      if (error.status === 400) {
        // increase tx fees
        gasPrices += 0.002;
      }
    } finally {
      await new Promise(r => setTimeout(r, config.PROCESS_INTERVAL));
      console.log('run nao');
      await this.runInterval(gasPrices);
    }
  }

  async submitReportInterval (gasPrices: number) {
    // query a list of send data
    const queryResult = await this.repoRequ.findUnsubmittedRequests();
    console.log("query result: ", queryResult);
    if (queryResult.length === 0) {
      return true;
    }
    // broadcast send tx & update tx hash
    const msgs = []; // msgs to broadcast to blockchain network
    let requestsData = []; // requests data to store into database
    for (let { requestId, threshold } of queryResult) {
      const reportCount = await this.repoExec.countExecutorReports(requestId);
    //     console.log("request id with report count and threshold: ", { requestId, reportCount, threshold });
    //     // only submit merkle root for requests that have enough reports
    //     if (reportCount === threshold) {
    //         // query a list of reports from the request id
    //         const reports = await mongoDb.queryExecutorReportsWithThreshold(requestId, threshold);
    //         // form a merkle root based on the value
    //         let [newRoot, leaves] = await formTree(reports);
    //         let request = await getRequest(env.CONTRACT_ADDRESS, requestId);
    //         let root = request.data.merkle_root ? request.data.merkle_root : newRoot;
    //         // if the request already has merkle root stored on-chain, then we only update our db accordingly
    //         if (request.data && request.data.merkle_root) {
    //             await processSubmittedRequest(requestId, root, newRoot, leaves, mongoDb);
    //             continue;
    //         }
    //         requestsData.push({ requestId, root, leaves });

    //         // collect the executor list from report to push to contract
    //         const executors = reports.map(report => report.executor);
    //         const msg = { contractAddress: env.CONTRACT_ADDRESS, msg: { register_merkle_root: { stage: parseInt(requestId), merkle_root: root, executors } } };
    //         msgs.push(msg)
    //     } else if (reportCount < threshold) {
    //         // in case report length is smaller than threshold, consider removing it if there exists a finished request in db
    //         const { submitted } = await mongoDb.findSubmittedRequest(requestId);
    //         if (submitted) await mongoDb.removeRedundantRequests(requestId);
    //     } else if (reportCount > threshold) {
    //         let numRedundant = reportCount - threshold;
    //         // update the reports so they have equal threshold
    //         await mongoDb.updateReports(parseInt(requestId), numRedundant);
    //     }
    }
    // if (msgs.length > 0) {
    //     // only broadcast new txs if has unfinished reports
    //     // query latest block
    //     await processUnsubmittedRequests(msgs, gasPrices, requestsData, mnemonic, mongoDb);
    // }
  }
}
