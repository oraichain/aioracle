import {
  Controller,
  Get,
  Query,
  Param,
  Body,
  ValidationPipe,
  HttpStatus,
  Post,
  Res
} from '@nestjs/common';
import { Response } from 'express';
import { ReportSubmitted, ReportReports, ExecutorsReportParam, ReportSingle, ReportPost } from '../dtos';
import { executorConverB64, paginatorNumber } from 'src/utils';
import { ExecutorRepository, RequestRepository } from 'src/repositories/mongo';
import config from 'src/config';
import { ExecutorService } from '../services';

@Controller('/report')
export class ReportController {
  constructor(private executorService: ExecutorService) {}

  @Get('/submitted')
  async checkSubmit(
    @Query(new ValidationPipe({
      transform: true,
      transformOptions: {enableImplicitConversion: true},
      forbidNonWhitelisted: true
    })) query: ReportSubmitted
  ) {
    const repo = new ExecutorRepository();
    await repo.db(query.contract_addr);
    const report = await repo.findReport(
      query.request_id,
      executorConverB64(query.executor)
    );
    if (!report) {
      return {
        code: HttpStatus.NOT_FOUND,
        submitted: false
      }
    };
    return {
      code: HttpStatus.OK,
      submitted: true,
      report: report && typeof report === 'object' ? report[0] : null,
    }
  }

  @Get('/reports')
  async getReports(
    @Res() res: Response,
    @Query(new ValidationPipe({
      transform: true,
      transformOptions: {enableImplicitConversion: true},
      forbidNonWhitelisted: true
    })) query: ReportReports
  ) {
    const pagerNumber = paginatorNumber(query.page_number, query.limit_per_page)
    const repo = new ExecutorRepository();
    await repo.db(query.contract_addr);
    const reports = await repo.findReports(query.request_id, pagerNumber);
    if (reports) {
      return res.status(HttpStatus.OK)
        .json({
          message: "successfully retrieved the reports",
          data: reports
        });
    }
    return res.status(HttpStatus.NOT_FOUND).json({
      message: "cannot find the reports with the given request id and contract address"
    });
  }

  /**
   * same fn checkSubmit()
   */
  @Get('/:executor')
  async getReport(
    @Res() res: Response,
    @Param() params: ExecutorsReportParam,
    @Query(new ValidationPipe({
      transform: true,
      transformOptions: {enableImplicitConversion: true},
      forbidNonWhitelisted: true
    })) query: ReportSingle
  ) {
    const repo = new ExecutorRepository();
    await repo.db(query.contract_addr);
    const report = await repo.findReport(query.request_id, params.executor);
    if (report) {
      return res.status(HttpStatus.OK)
        .json({
          message: "successfully retrieved the report",
          data: report
        });
    }
    return res.status(HttpStatus.NOT_FOUND).json({
      message: "cannot find the report with the given request id, contract address & executor"
    });
  }

  @Post('/')
  async submitReport(
    @Res() res: Response,
    @Body() body: ReportPost
  ) {
    const repo = new ExecutorRepository();
    await repo.db(config.CONTRACT_ADDRESS);
    const repoRequest = new RequestRepository();
    await repoRequest.db(config.CONTRACT_ADDRESS);
    const requestData = await this.executorService.getRequest(
      config.CONTRACT_ADDRESS,
      body.request_id
    );
    if (requestData.error === 1) {
      return res.status(requestData.status).json({
        message: requestData.data?.message
      });
    }
    const threshold = requestData.data?.threshold;
    // verify executor not in list
    const verifyContract = await this.executorService.isWhiteListed(config.CONTRACT_ADDRESS, body.report.executor);
    if (!verifyContract) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: "not in list"
      });
    }
    if (verifyContract && verifyContract.error === 1) {
      return res.status(verifyContract.status).json({
        message: verifyContract.message
      });
    }

    const { signature, ...rawReport } = body.report;
    // verify report signature
    const rawMessage = {
      requestId: body.request_id,
        report: rawReport
    }
    if (!this.executorService.verifySignature(
      Buffer.from(JSON.stringify(rawMessage), 'ascii'),
      Buffer.from(signature, 'base64'),
      Buffer.from(body.report.executor, 'base64'))
    ) {
        return res.status(HttpStatus.FORBIDDEN).json({
          message: "Invalid report signature"
        });
    }
    const executorReport = await repo.findReport(body.request_id, body.report.executor);
    // if we cant find the request id, we init new
    if (executorReport) {
      return res.status(HttpStatus.FORBIDDEN).json({
        message: "You already submitted the report"
      });
    }

    const reportCount = await repo.countExecutorReports(body.request_id);
    if (reportCount < threshold) {
      // insert executor with report for easy indexing & querying
      try {
        await repoRequest.insertRequest(body.request_id, threshold);
        await repo.insertExecutorReport(body.request_id, body.report.executor, body.report);
      } catch (err) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: err.message
        });
      }
      return res.status(HttpStatus.OK).json({
        message: "success"
      });
    }
    return res.status(HttpStatus.FORBIDDEN).json({
      message: 'request has already finished'
    });
  }
}
