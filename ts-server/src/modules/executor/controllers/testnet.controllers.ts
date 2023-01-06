import {
  Controller,
  Get,
  Body,
  HttpStatus,
  Post,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { ReportPost } from '../dtos';
import { ExecutorRepository, RequestRepository } from 'src/repositories/mongo';
import config from 'src/config';
import { ExecutorService } from '../services';

@Controller('/test')
export class TestnetController {
  constructor(private executorService: ExecutorService) {}
  
  @Get('/')
  async basicInsert() {
    const repo = new ExecutorRepository();
    await repo.db('test-collection');
    await repo.getDbInstance().collection('foobar').insertOne({ "foobar": "helloworld" });
    return {
      'message': 'insert',
    }
  }

  @Post('/')
  async submitReport(
    @Res() res: Response,
    @Body() body: ReportPost
  ) {
    const repo = new ExecutorRepository();
    await repo.db(config.CONTRACT_ADDR_BENCHMARKING);
    const requestData = await this.executorService.getRequest(
      config.CONTRACT_ADDR_BENCHMARKING,
      body.request_id
    );
    const threshold = requestData.data?.threshold;
    
    if (!(await this.executorService.isWhiteListed(
      config.CONTRACT_ADDR_BENCHMARKING,
      body.report.executor))
    ) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'not in list'
      })
    }
    // const { signature, ...rawReport } = body.report;
    // verify report signature
    let rawMessage = {
      requestId: 10,
      report: {
        "executor": "AipQCudhlHpWnHjSgVKZ+SoSicvjH7Mp5gCFyDdlnQtn",
        "data": "W3sibGFiZWwiOiJzdW5mbG93ZXIiLCJzY29yZSI6OTh9XQ==",
        "rewards": []
      }
    }
    const signature = 'WmOqn9Dy23YMAS/36G4xM6ezetUSgIg/ewZgMak6/LgmJKJXJ2TnhPYpEVTCPO1vu4lcPNsAbtYhsXG9dFhfcA==';
    if (!this.executorService.verifySignature(
      Buffer.from(JSON.stringify(rawMessage), 'ascii'),
      Buffer.from(signature, 'base64'),
      Buffer.from(body.report.executor, 'base64'))) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: "Invalid report signature"
      });
    } 
    let executorReport = await repo.findReport(body.request_id, body.report.executor);
    // if we cant find the request id, we init new
    const reportCount = await repo.countExecutorReports(body.request_id);
    const requestId = Math.floor(Math.random() * 1000000000000000);
    const repoRequest = new RequestRepository();
    await repoRequest.db(config.CONTRACT_ADDRESS);
    repoRequest.insertRequest(requestId, threshold);
    // insert executor with report for easy indexing & querying
    repo.insertExecutorReport(requestId, body.report.executor, body.report);
    return res.status(HttpStatus.OK)
      .json({
        message: 'success'
      });
  }
}
