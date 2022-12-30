import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ApiKey, ReportDaily } from 'src/entities';
import { ApiKeyRepository, ReportDailyRepository } from 'src/repositories';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import * as moment from "moment";
import { APIKEY_TYPE_URL } from 'src/constants';

@Injectable()
export class ApiKeyService {
  constructor(private readonly httpService: HttpService) {}

  async getAIReport(file: Express.Multer.File): Promise<any> {
    const formData = new FormData();

    formData.append('file', file?.buffer, {
      filename: file?.originalname,
    });

    // formData.append('file', Readable.from(file.buffer), {
    //   filename: file.originalname,
    // });
    try {
      const result = await firstValueFrom(
        this.httpService.post('/report_airight/report', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }),
      );

      return {
        result: result?.data,
        status: result?.status,
        statusText: result?.statusText,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        {
          message: 'Something went wrong',
          errorDetails: error?.message,
        },
        error?.code,
      );
    }
  }

  async getReport(file: Express.Multer.File, apiKey: string): Promise<any> {
    if (!apiKey) {
      throw new BadRequestException('api key should not be empty');
    }

    if (!file) {
      throw new BadRequestException('image should not be empty');
    }

    const existedApiKey = await ApiKeyRepository.findOne({
      where: {
        key: apiKey,
      },
    });

    if (!existedApiKey) {
      throw new BadRequestException('api key not found');
    }

    const { result, status, statusText } = await this.getAIReport(file);

    if (status !== 200) {
      throw new InternalServerErrorException(statusText);
    }

    await this.storeReportKeyDaily(existedApiKey.id, APIKEY_TYPE_URL.SIMILAR_MEDIA);
    return this.addFlagRedToReportFile(result);
  }

  /**
   * tang count report daily + 1 khi request key
   *
   * @param keyId int authen ai of key
   * @param urlType int url group type authen key
   * @returns 
   */
  async storeReportKeyDaily(keyId, urlType) {
    const dateTime = moment().format('YYYY-MM-DD');
    var reportDailyItem = await ReportDailyRepository.findOne({
      where: {
        keyId: keyId,
        date: dateTime,
        type: urlType
      },
    });
    if (reportDailyItem) {
      reportDailyItem.count = reportDailyItem.count + 1;
    } else {
      reportDailyItem = ReportDailyRepository.create({
        keyId: keyId,
        date: dateTime,
        type: urlType,
        count: 1,
      });
    }
    return ReportDailyRepository.save(reportDailyItem);
  }

  /**
   * add flag red toi ket qua report photo, verify and score >= 0.8 => red, not verify and score >= 0.8 => consider
   *
   * @param reportResult object AI response {exact_match: [], near_exact: [], semantic: []}
   * @returns object reportResult + flag
   */
  addFlagRedToReportFile(reportResult) {
    var isTypeScore = false;
    for (const typeMatch in reportResult) {
      if (!reportResult[typeMatch] || reportResult[typeMatch].length === 0) {
        continue;
      }
      if (typeMatch === 'semantic') {
        isTypeScore = true;
      }
      const flag = this.isExistNftVerifyScore(reportResult[typeMatch], isTypeScore);
      reportResult = Object.assign(reportResult, flag);
      if (flag.flag_red) {
        return reportResult;
      }
    }
    return reportResult;
  }

  /**
   * kiem tra ton tai co nft red (consider) hay khong trong 1 list nft
   *
   * @param listItem array [{nft informattion}, {}]
   * @param isTypeScore bool is type score, false => exact_match | near_exact
   * @returns object flag
   */
  isExistNftVerifyScore(listItem, isTypeScore) {
    const flag = {
      flag_red: false,
      flag_consider: false
    }
    for (const i in listItem) {
      // exact_match + near_exact || score cua semantic
      if (!isTypeScore || (isTypeScore && listItem[i].score >= 0.8)) {
        if (listItem[i].isVerified) {
          flag.flag_red = true;
          flag.flag_consider = false;
          return flag;
        } else {
          flag.flag_consider = true;
        }
      }
    }
    return flag;
  }
}
