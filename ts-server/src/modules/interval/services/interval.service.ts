import {
  Injectable,
} from '@nestjs/common';
import config from 'src/config';
import { ExecutorRepository, MerkleRepository, RequestRepository } from 'src/repositories/mongo';
import * as moment from "moment";
import { formTree } from 'src/utils';
import { ExecutorService } from 'src/modules/executor/services';
import WSS from 'src/utils/wss';
import { execute } from 'src/utils/cosmjs';
import { MerkleRootMsg, MerkleRootExecuteMsg } from 'src/dtos';
import { RequestMerkleRoot } from 'src/modules/executor/dtos';

@Injectable()
export class IntervalService {
  constructor() {}
  private repoExec: ExecutorRepository;
  private repoRequ: RequestRepository;
  private repoMerk: MerkleRepository;
  private executorService: ExecutorService;
  private wss: WSS;

  public async runMain() {
    this.wss = new WSS();
    let gasPrices = parseFloat(config.BASE_GAS_PRICES);
    this.repoExec = new ExecutorRepository();
    this.repoRequ = new RequestRepository();
    this.repoMerk = new MerkleRepository();
    await this.repoExec.db(config.CONTRACT_ADDRESS);
    await this.repoRequ.db(config.CONTRACT_ADDRESS);
    await this.repoMerk.db(config.CONTRACT_ADDRESS);

    await this.repoExec.indexData();
    this.executorService = new ExecutorService();
    await this.runInterval(gasPrices);
  }

  async runInterval(gasPrices: number, indexRunCount=1) {
    try {
      console.log('gas prices:', gasPrices, 
        ' -- run count:', indexRunCount,
        ' -- time:', moment().format()
      );
      await this.submitReportInterval(gasPrices);
    } catch (error) {
      console.log("error in interval process: ", error);
      if (error.status === 400) {
        // increase tx fees
        gasPrices += 0.002;
      }
    } finally {
      await new Promise(r => setTimeout(r, config.PROCESS_INTERVAL));
      await this.runInterval(gasPrices, indexRunCount+1);
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
    const msgs: MerkleRootExecuteMsg[] = []; // msgs to broadcast to blockchain network
    let requestsData: RequestMerkleRoot[] = []; // requests data to store into database
    for (let { requestId, threshold } of queryResult) {
      const reportCount = await this.repoExec.countExecutorReports(requestId);
      console.log("request id with report count and threshold: ", { requestId, reportCount, threshold });
      // only submit merkle root for requests that have enough reports
      if (reportCount === threshold) {
        // query a list of reports from the request id
        const reports = await this.repoExec.queryExecutorReportsWithThreshold(requestId, threshold);
        // form a merkle root based on the value
        let [newRoot, leaves] = await formTree(reports);
        let request = await this.executorService.getRequest(
          config.CONTRACT_ADDRESS,
          requestId
        );
        let root = request.data?.merkle_root ? request.data.merkle_root : newRoot;
        // if the request already has merkle root stored on-chain, then we only update our db accordingly
        if (request.data && request.data.merkle_root) {
          await this.processSubmittedRequest(requestId, root, newRoot, leaves);
          continue;
        }
        requestsData.push({ requestId, root, leaves } as RequestMerkleRoot);

        // collect the executor list from report to push to contract
        const executors = reports.map(report => report.executor);
        msgs.push({
          contractAddress: config.CONTRACT_ADDRESS,
          msg: {
            register_merkle_root: {
              stage: requestId,
              merkle_root: root,
              executors
            } as MerkleRootMsg
          }
        } as MerkleRootExecuteMsg);
      } else if (reportCount < threshold) {
        // in case report length is smaller than threshold, consider removing it if there exists a finished request in db
        const { submitted } = await this.repoRequ
          .findSubmittedRequest(requestId);
        if (submitted) {
          const removeResult = await this.repoRequ
            .removeRedundantRequests(requestId);
          console.log('remove request', removeResult);
        }
      } else if (reportCount > threshold) {
        let numRedundant = reportCount - threshold;
        // update the reports so they have equal threshold
        const removeResult = await this.repoExec.updateReports(requestId, numRedundant);
        console.log('remove exec report', removeResult);
      }
    }

    if (msgs.length > 0) {
        // only broadcast new txs if has unfinished reports
        // query latest block
        await this.processUnsubmittedRequests(
          msgs,
          gasPrices,
          requestsData
        );
    }
  }

  async processSubmittedRequest (
    requestId: number,
    submittedMerkleRoot: string,
    localMerkleRoot: string,
    leaves: string
  ) {
    console.log("merkle root already exists for this request id")
    if (submittedMerkleRoot !== localMerkleRoot) {
      console.log("root is inconsistent. Skip this request");
      return;
    }
    try {
      // try inserting the merkle root if does not exist in db
      const merkleRoot = await this.repoMerk.findMerkleRoot(submittedMerkleRoot);
      if (!merkleRoot) {
        const insert = await this.repoMerk.insertMerkleRoot(submittedMerkleRoot, leaves);
        console.log('insert merkroot', insert);
      }
      // try updating the submitted status to true for this request
      const { submitted } = await this.repoRequ.findRequest(requestId);
      if (!submitted) {
        await this.repoExec.updateReportsStatus(requestId);
      }
    } catch (error) {
      console.log("error in process submitted request: ", error);
      // index('process-submitted-request-errors', { error: JSON.stringify(error), ...getCurrentDateInfo() })
    }
  }

  async processUnsubmittedRequests (
    msgs: MerkleRootExecuteMsg[],
    gasPrices: number,
    requestsData: RequestMerkleRoot[]
  ) {
    try {
      // const latestBlockData = await getLatestBlock();
      // const timeoutHeight = parseInt(latestBlockData.block.header.height) + constants.TIMEOUT_HEIGHT;

      // broadcast merkle root to all ws clients. ws is used to reduce time waiting for merkle root to be submitted on-chain
      this.wss.broadcastMerkleRoot(requestsData);

      // store the merkle root on-chain
      const executeResult = await execute({
          mnemonic: config.MNEMONIC,
          msgs,
          memo: "",
          gasData: { gasAmount: gasPrices, denom: "orai" },
      });
      console.log("execute result: ", executeResult);
      // check error
      if (executeResult.transactionHash) {
        // only store root on backend after successfully store on-chain (can easily recover from blockchain if lose)
        await Promise.all(
          requestsData.map((tree: RequestMerkleRoot) => 
            this.repoMerk.insertMerkleRoot(tree.root, tree.leaves)
        ));

        // update the requests that have been handled in the database
        const bulkResult = await this.repoRequ.bulkUpdateRequests(
          requestsData,
          executeResult.transactionHash
        );
        console.log('bulk insert request', bulkResult);
      } else {
        console.log("error in submitting merkle root: ", executeResult);
        // index('submit-merkle-errors', { error: executeResult.message, ...getCurrentDateInfo() });
      }
    } catch (error) {
        console.log("error in process unsubmitted requests: ", error);
        // index('process-unsubmitted-requests-error', { error: JSON.stringify(error), ...getCurrentDateInfo() });
    }
  }
}
