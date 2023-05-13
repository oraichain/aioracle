import {
  Injectable,
} from '@nestjs/common';
import axios from 'axios';
import { Message, sha256 } from 'js-sha256';
import * as secp256k1 from 'secp256k1';
import config from 'src/config';
import { RequestStage, LcdRequestBase } from 'src/dtos';
import { AioracleContractTypes } from '@oraichain/aioracle-contracts-sdk';

@Injectable()
export class ExecutorService {
  constructor() { }

  async requestLcd(contractAddr: string, input: any): Promise<LcdRequestBase> {
    const url = `${config.LCD_URL}/cosmwasm/wasm/v1/contract/${contractAddr}` +
      `/smart/${Buffer.from(input).toString('base64')}`;
    let resData: LcdRequestBase;
    await axios.get(url)
      .then(res => {
        resData = res.data;
      }).catch(err => {
        resData = {
          error: 1,
          status: err.response?.status,
          data: err.response?.data,
          message: err.response?.data?.message
        };
      });
    return resData;
  }

  async getRequest(contractAddr: string, requestId: number): Promise<RequestStage> {
    const input = JSON.stringify({
      get_request: {
        stage: requestId
      }
    } as AioracleContractTypes.QueryMsg)
    return await this.requestLcd(contractAddr, input);
  }

  async isWhiteListed(contractAddr: string, executor: string) {
    const input = JSON.stringify({
      check_executor_in_list: {
        address: executor
      }
    } as AioracleContractTypes.QueryMsg);
    const isInList = (await this.requestLcd(contractAddr, input)).data as boolean;
    if (isInList) {
      return true;
    }
    return false;
  }

  verifySignature(bufferMessage: Message, signature: Uint8Array, pubkey: Uint8Array) {
    // on contract, when parsing from hex string to bytes it uses from utf8 func (ascii)
    const hashedSig = sha256.update(bufferMessage).digest();
    const bufferHashedSig = Uint8Array.from(hashedSig);
    return secp256k1.ecdsaVerify(signature, bufferHashedSig, pubkey);
  }
}
