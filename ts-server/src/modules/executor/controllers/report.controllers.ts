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
import { ReportSubmitted, ReportReports } from '../dtos';
import { executorConverB64, paginatorNumber } from 'src/utils';
import { ExecutorRepository } from 'src/repositories/mongo';

@Controller('/report')
export class ReportController {

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
}
