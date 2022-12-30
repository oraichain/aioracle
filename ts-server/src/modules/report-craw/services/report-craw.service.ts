import { Injectable } from '@nestjs/common';
import * as moment from "moment";
import axios from 'axios';
import { Between } from 'typeorm';
import { ReportCrawRepository, ChainRepository , MarketRepository } from 'src/repositories';
import { keyByColum } from 'src/utils/app.common';
import { REPORT_TYPE } from 'src/constants/chain';
import config from 'src/config';
import { ReportTypeFactory } from '../factories/report-type.factory';
import { MongoDB } from 'src/provides/mongodb';

@Injectable()
export class ReportCrawService {
  constructor(
  ) {}
  private chain = null;
  private market = null;

  /**
   * report filter by date, get data with chain, market
   *
   * @param from date Y-m-d
   * @param to date Y-m-d
   * @returns json {
   *  'date': {
   *    'type': {
   *      'typeName': count
   *    }
   *  }
   * }
   */
  async findByEachDate(from, to) {
    const dayPeriod = this.execday(from, to);
    const reports = await ReportCrawRepository.find({
      'where': {
        'date': Between(dayPeriod['from'], dayPeriod['to'])
      }
    });
    if (!reports || reports.length === 0) {
      return {};
    }
    const result = {};
    for (const i in reports) {
      const item = reports[i];
      if (!result[item.date]) {
        result[item.date] = {};
      }
      if (!result[item.date][item.type]) {
        result[item.date][item.type] = {};
      }
      const itemType = await this.findItemType(item.type, item.name);
      result[item.date][item.type][itemType?.name ? itemType?.name : item.name] = item.count;
    }
    return result;
  }

  /**
   * get total report period
   *
   * @param from string
   * @param to string
   * @returns json
   */
  async findByTotalDate(from, to) {
    const dayPeriod = this.execday(from, to);
    const reports = await ReportCrawRepository.find({
      'where': {
        'date': Between(dayPeriod['from'], dayPeriod['to'])
      }
    });
    const result = {
      'date': dayPeriod,
      'total': {}
    };
    if (!reports || reports.length === 0) {
      return result;
    }
    for (const i in reports) {
      const item = reports[i];
      if (!result['total'][item.type]) {
        result['total'][item.type] = {};
      }
      if (!result['total'][item.type][item.name]) {
        result['total'][item.type][item.name] = {
          'name': null,
          'count': 0
        };
      }
      const itemType = await this.findItemType(item.type, item.name);
      result['total'][item.type][item.name]['name'] = itemType?.name;
      result['total'][item.type][item.name]['count'] += item.count;
    };
    return result;
  }

  /**
   * lay data tu table ai, thong ke 1 ngay craw duoc bao nhieu data theo chain, market
   *
   * @param from string datetime
   * @param to string datetime
   */
  async getDataIntoReport(from, to) {
    const dayPeriod = this.execday(from, to);
    from = moment(dayPeriod.from);
    to = moment(dayPeriod.to);
    while (to.isSameOrAfter(from)) {
      await this.callReportData(from, 'marketName', REPORT_TYPE.MARKET);
      await this.callReportData(from, 'network', REPORT_TYPE.CHAIN);
      from.add(1, 'days');
    }
    return dayPeriod;
  }

  /**
   * call api toi ai, group by theo col (market, chain) va count
   *
   * @param from moment
   * @param colDB string
   * @param type int
   */
  async callReportData(from, colDB, type) {
    const body = this.execBodyCount(from.startOf('day').valueOf(), from.endOf('day').valueOf(), colDB);
    const collNft = await MongoDB.collection();
    const dataNft = await collNft.aggregate(body.aggregate_data);
    for await (const doc of dataNft) {
      await this.saveReportData(doc, from.format('YYYY-MM-DD'), type);
    }
    // const response = await axios.post(config.AI_URL + '/gateway_mongo/find', body);
  }

  /**
   * save data thong ke vao db, co thi update, khong co thi insert
   *
   * @param data array
   * @param date string datetime
   * @param type int
   * @returns 
   */
  async saveReportData(item, date, type) {
    if (!item) {
      return true;
    }
    var name;
    if (!item._id.groupName) {
      name = '';
    } else {
      name = item._id.groupName.toLowerCase();
    }
    const nameId = await this.insertTypeWhenAggregate(type, name);
    var newItem = await ReportCrawRepository.findOne({
      where: {
        date: date,
        type: type,
        name: nameId
      }
    });
    if (!newItem) {
      newItem = ReportCrawRepository.create({
        date: date,
        type: type,
        name: nameId,
        count: item.count
      });
    } else {
      newItem.count = item.count;
    }
    await ReportCrawRepository.save(newItem);
  }

  /**
   * find item follow type id
   *
   * @param typeId int
   * @param nameId
   * @param chain collection
   * @param market collection
   * @returns 
   */
  async findItemType(typeId, nameId) {
    if (!this.chain) {
      this.chain = keyByColum(await ChainRepository.find(), 'id');
    }
    if (!this.market) {
      this.market = keyByColum(await MarketRepository.find(), 'id');
    }
    var objsType = null;
    switch (typeId) {
      case REPORT_TYPE.CHAIN:
        objsType = this.chain;
        break;
      case REPORT_TYPE.MARKET:
        objsType = this.market;
        break;
      default:
        return null;
    }
    return objsType[nameId] ? objsType[nameId] : null;
  }

  /**
   * find item follow type id
   *
   * @param typeId int
   * @param nameId
   * @param chain collection
   * @param market collection
   * @returns 
   */
   async findItemTypeByName(typeId, name) {
    await this.findTypeCollection();
    var objsType = null;
    switch (typeId) {
      case REPORT_TYPE.CHAIN:
        objsType = this.chain;
        break;
      case REPORT_TYPE.MARKET:
        objsType = this.market;
        break;
      default:
        return null;
    }
    for (const [i, j] of Object.entries(objsType)) {
      if (j['name'] == name) {
        return i;
      }
    }
    return null;
  }

  async insertTypeWhenAggregate(type, name) {
    const nameId = await this.findItemTypeByName(type, name);
      if (nameId) {
        return parseInt(nameId);
      }
      const repoFactory = ReportTypeFactory(type);
      if (!repoFactory) {
        return null;
      }
      const newItem = repoFactory.create({name: name});
      const item = await repoFactory.save(newItem);
      this.resetTypeCollection();
      return item.id;
  }

  private execday(from, to) {
    const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    const maxPeriod = 366;

    if (!from && !to) {
      return {
        'from': yesterday,
        'to': yesterday,
      }
    }
    if (from) {
      from = moment(from);
    }
    if (to) {
      to = moment(to);
    }
    if (from && !to) {
      to = from.clone().add(maxPeriod, 'days');
    } else if(!from && to) {
      from = to.clone().subtract(maxPeriod, 'days');
    }
    if (to.diff(from, 'days') > maxPeriod) {
      to = from.clone().add(maxPeriod, 'days');
    }
    return {
      'from': from.format('YYYY-MM-DD'),
      'to': to.format('YYYY-MM-DD'),
    }
  }

  /**
   * 
   * @param from string date
   * @param to string date
   * @param groupName string group by column db
   * @returns 
   */
  private execBodyCount(from, to, groupName) {
    return {
      "aggregate_data": [
        {
          "$match": {
            "craw_at": {
              "$gte": from,
              "$lte": to
            }
          }
        },
        {
          "$group": {
              "_id": {
                  groupName: `$${groupName}`
              },
              "count": {
                  "$sum": 1
              }
          }
      }
      ]
    };
  }

  private async findTypeCollection() {
    if (!this.chain) {
      this.chain = keyByColum(await ChainRepository.find(), 'id');
    }
    if (!this.market) {
      this.market = keyByColum(await MarketRepository.find(), 'id');
    }
  }

  private resetTypeCollection() {
    this.chain = null;
    this.market = null;
  }
}