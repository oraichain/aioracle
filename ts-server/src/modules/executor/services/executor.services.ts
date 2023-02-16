import {
  Injectable,
} from '@nestjs/common';
import axios from 'axios';
import { sha256 } from 'js-sha256';
import * as secp256k1 from 'secp256k1';
import config from 'src/config';
import { RequestStage, ExecutorPubkey, LcdRequestBase } from 'src/dtos';

@Injectable()
export class ExecutorService {
  constructor() {}

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

  async getRequest (contractAddr: string, requestId: number): Promise<RequestStage> {
    const input = JSON.stringify({
      request: {
        stage: requestId
      }
    })
    return await this.requestLcd(contractAddr, input);
  }

  async isWhiteListed (contractAddr: string, executor: string) {
    const input = JSON.stringify({
      get_executor: {
        pubkey: executor
      }
    });
    const resData = await this.requestLcd(contractAddr, input) as ExecutorPubkey;
    if (resData.data?.is_active) {
      return true;
    }
    return false;
  }

  verifySignature (bufferMessage, signature, pubkey) {
    // on contract, when parsing from hex string to bytes it uses from utf8 func (ascii)
    const hashedSig = sha256.update(bufferMessage).digest();
    const bufferHashedSig = Uint8Array.from(hashedSig);    
    return secp256k1.ecdsaVerify(signature, bufferHashedSig, pubkey);
  }
}
