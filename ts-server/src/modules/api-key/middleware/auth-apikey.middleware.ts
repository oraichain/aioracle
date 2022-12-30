import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import * as moment from "moment";
import { ApiKeyRepository, ReportDailyRepository } from "src/repositories";


@Injectable()
export class AuthApikeyMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.header('api-key');
    if (!apiKey) {
      throw new UnauthorizedException('Api key not found');
    }
    const existedApiKey = await ApiKeyRepository.findOne({
      where: {
        key: apiKey,
      },
    });
    if (!existedApiKey) {
      throw new UnauthorizedException('Api key not found');
    }
    if (existedApiKey.status !== 1) {
      throw new UnauthorizedException('Api key not active');
    }
    if (req.method?.toLowerCase() == 'get') {
      res.locals.auth = existedApiKey;
      return next();
    }
    // check time request
    if (!this.checkTimeRequest(existedApiKey)) {
      throw new UnauthorizedException('Api key expired');
    }
    if (!await this.checkMaxRequest(existedApiKey)) {
      throw new UnauthorizedException('Api key limit exceeded');
    }
    res.locals.auth = existedApiKey;
    next();
  }

  checkTimeRequest(existedApiKey) {
    if (!existedApiKey.timeEnd && !existedApiKey.timeStart) {
      return true;
    }
    const now = moment();
    var timeStart;
    var timeEnd;
    if (existedApiKey.timeStart) {
      timeStart = moment(existedApiKey.timeStart);
      existedApiKey.timeStart = timeStart;
    } else {
      timeStart = now.clone();
    }
    if (existedApiKey.timeEnd) {
      timeEnd = moment(existedApiKey.timeEnd);
      existedApiKey.timeEnd = timeEnd;
    } else {
      timeEnd = now.clone();
    }
    if (timeStart.isSameOrBefore(now) && now.isSameOrBefore(timeEnd)) {
      return true;
    }
    return false;
  }

  async checkMaxRequest(existedApiKey) {
    if (!existedApiKey.maxRequest) {
      return true;
    }
    var strWhereDate = '';
    if (existedApiKey.timeStart) {
      strWhereDate = `date >= '${existedApiKey.timeStart.format('YYYY-MM-DD')}'`;
    }
    if (existedApiKey.timeEnd) {
      strWhereDate += `${strWhereDate ? ' AND ' : ''}date <= '${existedApiKey.timeEnd.format('YYYY-MM-DD')}'`;
    }
    var sumRequestDate = ReportDailyRepository
      .createQueryBuilder()
      .select('SUM(count)', 'count')
      .where(`keyId = ${existedApiKey.id}`);
    if (strWhereDate) {
      sumRequestDate = sumRequestDate.andWhere(strWhereDate);
    }
    sumRequestDate = await sumRequestDate.getRawOne();
    if (sumRequestDate['count'] && parseInt(sumRequestDate['count']) >= existedApiKey.maxRequest) {
      return false;
    }
    return true;
  }
}
