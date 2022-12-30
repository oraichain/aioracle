import { STATUS } from 'src/constants';
import * as fs from 'fs';
import { stringToJson } from 'src/utils';
import config from 'src/config';

const folderColletionSimilarResultJson = `${config.basedir}storage/collection_report/`;
const MAX_NFT_REPORT_SEMANTIC = 20;

export class ReportCollectionSimilar {
  private item;

  constructor(item?) {
    if (item) {
      this.setItem(item);
    }
  }

  setItem(item) {
    this.item = item;
    this.item.summary = stringToJson(this.item.summary);
  }

  status() {
    for (const i in STATUS) {
      if (STATUS[i] == this.item.status) {
        return i;
      }
    }
    return 'N/A';
  }

  numberVerified() {
    return this.item.flagRed + this.item.flagConsider + this.item.flagReliable;
  }

  rateRed(totalChecked?) {
    if (!totalChecked) {
      totalChecked = this.numberVerified();
    }
    if (!totalChecked || totalChecked === 0) {
      return 0;
    }
    return parseFloat(((this.item.flagRed / totalChecked ) * 100).toFixed(2));
  }

  rateConsider(totalChecked?) {
    if (!totalChecked) {
      totalChecked = this.numberVerified();
    }
    if (!totalChecked || totalChecked === 0) {
      return 0;
    }
    return parseFloat(((this.item.flagConsider / totalChecked ) * 100).toFixed(2));
  }

  toSummary() {
    const totalChecked = this.numberVerified();
    const rateRed = this.rateRed(totalChecked);
    const rateConsider = this.rateConsider(totalChecked);
    return {
      red: {
        number: this.item.flagRed,
        rate: rateRed,
        nft: this.item.summary.nftRed,
      },
      consideration: {
        number: this.item.flagConsider,
        rate: rateConsider,
        nft: this.item.summary.nftConsider,
      },
      reliable: {
        number: this.item.flagReliable,
        rate: parseFloat((100 - rateRed - rateConsider).toFixed(2)),
      }
    };
  }

  toJson() {
    return {
      status: this.status(),
      contract: this.item.contract,
      total_supply: this.item.totalSupply,
      number_verified: this.numberVerified(),
      summary: this.toSummary()
    }
  }

  /**
   * filter attr nft result before save db
   *
   * @param detail json object format {
        "8": {
            "exact_match": [],
            "near_exact": [],
            "semantic": [
                {
                    "authorAddress": "0x523da324fe038360fe08799c2bb3e9b5172bfdcc",
                    "contract": "0xc9154424b823b10579895ccbe442d41b9abd96ed",
                    "tokenId": "123" .....
                }
            ]
        },
   */
  filterAttrDetail(detail) {
    const arrayAttrFilter = ['contract', 'tokenId', 'network', 'image', 'name', 'market', 'description', 'marketName', 'isVerified', 'score']
    for (const tokenID in detail) { // tokenId: {detail similar report}
      const matchObj = detail[tokenID];
      for (const typeMatch in matchObj) { // sematic: [ nft report ]
        const matchTypeDetailObj = matchObj[typeMatch];
        if (!matchTypeDetailObj || matchTypeDetailObj.length === 0) {
          continue;
        }
        for (const i in matchTypeDetailObj) { // index { nft info similar }
          const matchTypeDetailItem = matchTypeDetailObj[i];
          for (const attrName in matchTypeDetailItem) { // { attr filter: value attr }
            if (!arrayAttrFilter.includes(attrName)) {
              delete matchTypeDetailItem[attrName];
            }
          }
        }
      }
    }
    return detail;
  }

  /**
   * get 20 top scope of match (near, exact, semantic)
   *
   * @param detail 
   * @returns 
   */
  filterMaxNftSemantic(detail) {
    const result = {};
    for (const tokenID in detail) { // tokenId: {detail similar report}
      result[tokenID] = {};
      const matchObj = detail[tokenID];
      for (const typeMatch in matchObj) { // sematic: [ nft report ]
        result[tokenID][typeMatch] = [];
        var matchTypeDetailObj = matchObj[typeMatch];
        if (!matchTypeDetailObj || matchTypeDetailObj.length === 0) {
          continue;
        }
        matchTypeDetailObj.sort((x, y) => {
          return x.score <= y.score ? 1 : -1
        });
        matchTypeDetailObj = matchTypeDetailObj.slice(0, MAX_NFT_REPORT_SEMANTIC);
        result[tokenID][typeMatch] = matchTypeDetailObj;
      }
    }
    return result;
  }

  /**
   * append data when detail report send: flag, write file
   *
   * @param detail json detail report
   * @returns 
   */
  appendItemDetail(detail) {
    if (!detail || Object.keys(detail).length === 0) {
      return this.item;
    }
    detail = this.filterMaxNftSemantic(detail);
    detail = this.filterAttrDetail(detail);
    const reportCount = this.detailCountFlag(detail);
    this.writeFileJsonDetail(detail);
    this.item.flagRed += reportCount.red;
    this.item.flagConsider += reportCount.consider;
    this.item.flagReliable += reportCount.reliable;
    this.appendItemSummary(reportCount.summary);
    this.item.summary = JSON.stringify(this.item.summary);
    return this.item;
  }

  /**
   * 
   * @param summaryData json list summary flag {
        nftRed: nftRed,
        nftConsider: nftConsider
      }
   */
  appendItemSummary(summaryData) {
    for(const arrFlag in summaryData) {
      if (!this.item.summary[arrFlag]) {
        this.item.summary[arrFlag] = summaryData[arrFlag];
      } else {
        this.item.summary[arrFlag] = this.item.summary[arrFlag].concat(summaryData[arrFlag]);
      }
    }
  }

  writeFileJsonDetail(detail) {
    const fileJson = this.getFileJsonDetail();
    fs.mkdirSync(folderColletionSimilarResultJson, { recursive: true });
    detail = JSON.stringify(detail);
    if (!fs.existsSync(fileJson) || fs.readFileSync(fileJson).length === 0) { // write file first
      detail = detail.slice(0, -1);
    } else {
      detail = ',' + detail.slice(1, -1);
    }
    fs.appendFileSync(fileJson, detail);
  }

  /**
   * file json detail report
   *
   * @returns string
   */
  getFileJsonDetail() {
    return `${folderColletionSimilarResultJson}${this.item.contract}_${this.item.id}.json`;
  }

  completeFileJson() {
    const fileJson = this.getFileJsonDetail();
    fs.mkdirSync(folderColletionSimilarResultJson, { recursive: true });
    var jsonSummary = JSON.stringify(this.toJson());
    jsonSummary = jsonSummary.slice(0, -1) + ',"detail":';
    const dataDetail = fs.readFileSync(fileJson, 'utf8');
    fs.writeFileSync(fileJson, jsonSummary + dataDetail + '}}');
    return fileJson;
  }

  /**
   * count flag red, consider or reliable follow exact match
   *
   * @param detail json report ai send
   * @returns json
   */
   detailCountFlag(detail) {
    var countRed = 0;
    var countConsider = 0;
    var countReliable = 0;
    var nftRed = [];
    var nftConsider = [];
    for (const i in detail) {
      var flagCheckNft = false;
      if (detail[i].exact_match && detail[i].exact_match.length > 0) {
        countRed++; // co exact match => fake => red
        nftRed.push(i);
        flagCheckNft = true;
        continue;
      }
      if (detail[i].near_exact && detail[i].near_exact.length) {
        countConsider++;
        nftConsider.push(i);
        flagCheckNft = true;
        continue;
      }
      if (detail[i].semantic && detail[i].semantic.length) {
        for (const j in detail[i].semantic) {
          const semanticItem = detail[i].semantic[j];
          if (semanticItem.score >= 0.8) {
            countRed++;
            nftRed.push(i);
            flagCheckNft = true;
            break;
          } else if (semanticItem.score >= 0.55) {
            countConsider++;
            nftConsider.push(i);
            flagCheckNft = true;
            break;
          }
        }
      }
      if (!flagCheckNft) {
        countReliable++;
      }
    }
    return {
      red: countRed,
      consider: countConsider,
      reliable: countReliable,
      summary: {
        nftRed: nftRed,
        nftConsider: nftConsider
      }
    }
  }
}