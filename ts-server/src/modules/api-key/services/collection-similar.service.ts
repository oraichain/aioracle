import {
  BadRequestException,
  Injectable
} from '@nestjs/common';
import { isNumberString } from 'class-validator';
import * as randomstring from 'randomstring';
import * as moment from "moment";
import axios from 'axios';
import { AppQueue } from 'src/provides/queue/app.queue';
import { CollectionSimilarRepository, ChainRepository, ApiKeyRepository } from 'src/repositories';
import config from 'src/config';
import { AppMailer } from 'src/provides/mailer/app.mailer';
import { APIKEY_TYPE_URL, STATUS } from 'src/constants';
import { ApiKeyService, ReportCollectionSimilar } from '.';
import { logError } from 'src/provides/log.provide';
import { getAttrsOfObj } from 'src/utils';

@Injectable()
export class CollectionSimilarService {
  constructor(private apiKeyService: ApiKeyService) {}
  /**
   * user send request verify similar collection
   *
   * @param payload json body params
   * @returns string
   */
  async requestCollectionSimilar(payload, auth?) {
    await this.isContractValid(payload);
    const isVerified = await this.isCollectionVerified(payload.contract);
    if (isVerified) {
      return getAttrsOfObj(isVerified, ['isVerified', 'marketName']);
    }
    const item = await this.storeDB(payload, auth);
    await this.addQueue(payload, item);
    const url = this.getUrlReportStatus(item);
    await this.apiKeyService.storeReportKeyDaily(auth.id, APIKEY_TYPE_URL.VERIFY_COLLECTION);
    this.sendMail(item, url, auth);
    return {
      url: url
    };
  }

  /**
   * check collection contract verify by market
   *
   * @param contract string
   * @returns bool | object
   */
  async isCollectionVerified(contract) {
    try {
      const bodyData = {
          "aggregate_data": [
            {
              "$match": {
                "contract": contract,
                "isVerified": true,
                "marketName": {"$ne":null},
              }
            },
            {
              "$project": {
                "_id": 0
              }
            },
            {
              "$limit": 1
            }
          ]
      };
      const response = await axios.post(config.AI_URL + '/gateway_mongo/find', bodyData);
      if (response.data && response.data.length > 0) {
        return response.data[0];
      }
      return false;
    } catch (err) {
      logError(err.message, err.response?.status);
    }
    return false;
  }

  /**
   * check contract address is valid?
   *
   * @param payload object {contract, chain}
   */
  async isContractValid(payload) {
    var chain = payload.chain;
    if (chain === 'ethereum') {
      chain = 'eth';
    }
    try {
      const response = await axios.get(config.CRAW_URL + `/api/v2/nft/${payload.contract}?chain=${chain}&limit=1`, {
        headers: {
          'x-api-key': config.CRAW_APIKEY
        }
      });
      const data = response.data;
      if (!data || !data.total) { // total = 0
        throw new BadRequestException('Collection contract without NFT');
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        throw new BadRequestException('contract is invalid');
      }
      logError(err.message, err.response?.status);
    }
    return true;
  }

  /**
   * store report to db
   *
   * @param payload json body params
   * @returns 
   */
  async storeDB(payload, auth?) {
    const chain = await ChainRepository.findOne({
      where: {
        name: payload.chain
      }
    });
    if (!chain) {
      throw new BadRequestException("Chain not found");
    }
    const entity = CollectionSimilarRepository.create(payload);
    entity['code'] = randomstring.generate(8);
    entity['chain'] = chain.id;
    entity['keyId'] = auth?.id;
    return await CollectionSimilarRepository.save(entity);
  }

  /**
   * add event report to queue
   *
   * @param payload json body params
   * @returns 
   */
  async addQueue(payload, item) {
    const queueJob = new AppQueue('CollectionSimilar', {
      attempts: 100,
    });
    payload.reportId = item.id;
    payload.isProd = config.isProd;
    return await queueJob.add(payload);
  }

  /**
   * get url status process verify
   *
   * @param item entity
   * @returns 
   */
  getUrlReportStatus(item) {
    return `${config.APP_URL}/report/collection/status/${item.id}-${item.code}`;
  }

  /**
   * send email noti user
   *
   * @param item 
   * @param url 
   */
  async sendMail(item, url, auth?) {
    if (!item.email) {
      return;
    }
    AppMailer(item.email, 'Confirm request for AI Oracle - NFT Authenticity Verification Service', {
      template: 'collection-similar',
      templateData: {
        url: url,
        contract: item.contract,
        email: item.email,
        dateFormat: moment(item.createdAt).format('HH:mm - DD/MM/YYYY'),
        apiKey: await this.getApikeyShort(item, auth)
      }
    });
  }

  /**
   * lay data tu ben ai gui sang, update vao detail
   *
   * @param reportId int
   * @param payload json {status: 1, report {}}
   * @returns 
   */
  async receiveInfoReport(reportId, payload) {
    var reportItem = await CollectionSimilarRepository.findOne({where: {id: reportId}});
    if (!reportItem) {
      throw new BadRequestException('Report not found');
    }
    if (reportItem.status == STATUS.done) {
      throw new BadRequestException('Report was done, not update');
    }
    if (payload.status) {
      reportItem.status = payload.status;
    }
    if (payload.totalSupply) {
      reportItem.totalSupply = payload.totalSupply;
    }
    var reportResult = null;
    if (payload.report) {
      reportResult = new ReportCollectionSimilar(reportItem);
      reportItem = reportResult.appendItemDetail(payload.report);
    }
    await CollectionSimilarRepository.save(reportItem);
    // send mail when done
    if (reportItem.status == STATUS.done) {
      if (!reportResult) {
        reportResult = new ReportCollectionSimilar(reportItem);
      }
      const fileReport = reportResult.completeFileJson();
      if (reportItem.email) {
        AppMailer(reportItem.email, 'Result report for collection verification', {
          template: 'collection-similar-result',
          templateData: {
            email: reportItem.email,
            contract: reportItem.contract,
            url: this.getUrlReportStatus(reportItem),
            itemSummary: reportResult.toSummary(),
            dateFormat: moment(reportItem.createdAt).format('HH:mm - DD/MM/YYYY'),
            apiKey: await this.getApikeyShort(reportItem),
            itemResultJson: reportResult.toJson()
          },
          attachments: [{
            path: fileReport
          }],
          attachRenameFlag: true
        });
      }
    }
  }

  async progessStatus(idCode) {
    idCode = idCode.split('-');
    if (!idCode || idCode.length !== 2 || !isNumberString(idCode[0])) {
      throw new BadRequestException("Report ID not found");
    }
    const item = await CollectionSimilarRepository.findOne({
      where: {
        id: idCode[0]
      }
    });
    if (!item || item.code !== idCode[1]) {
      throw new BadRequestException("Report ID not found");
    }
    const reportResult = new ReportCollectionSimilar(item);
    return reportResult.toJson();
  }

  async getApikeyShort(reportItem?, auth?) {
    if (!auth) {
      auth = await ApiKeyRepository.findOne({
        where: {
          id: reportItem.keyId,
        },
      });
    }
    return auth.key.slice(0, 2) + '******' + auth.key.slice(-2);
  }
}
