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
import { ExecutorsReport, ExecutorsReportHexParam, ExecutorsReportParam } from '../dtos';
import { executorConverB64, paginatorNumber } from 'src/utils';
import { ExecutorRepository } from 'src/repositories/mongo';

@Controller('/executor')
export class ExecutorController {
  @Get('/:executor')
  async getExecutorsReport(
    @Param() params: ExecutorsReportParam,
    @Query(new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true
    })) query: ExecutorsReport
  ) {
    const pagerNumber = paginatorNumber(query.page_number, query.limit_per_page)
    const repo = new ExecutorRepository();
    await repo.db(query.contract_addr);
    const res = await repo.findExecutorReports(params.executor, pagerNumber);
    res['code'] = HttpStatus.OK;
    return res;
  }

  @Get('/finished/:executor')
  async getFinishedExecutorReports(
    @Param() params: ExecutorsReportHexParam,
    @Query(new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: true
    })) query: ExecutorsReport
  ) {
    const pagerNumber = paginatorNumber(query.page_number, query.limit_per_page)
    const repo = new ExecutorRepository();
    await repo.db(query.contract_addr);
    const res = {
      code: HttpStatus.OK
    };
    res['data'] = await repo.findFinishedExecutorReports(
      executorConverB64(params.executor),
      pagerNumber
    );
    return res;
  }
}
