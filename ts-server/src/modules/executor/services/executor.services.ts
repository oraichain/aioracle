import {
  Injectable,
} from '@nestjs/common';
import axios from 'axios';
import { sha256 } from 'js-sha256';
import * as secp256k1 from 'secp256k1';
import config from 'src/config';


@Injectable()
export class ExecutorService {
  constructor() {}

  async getRequest (contractAddr, requestId) {
    const input = JSON.stringify({
      request: {
        stage: requestId
      }
    })
    const url = `${config.LCD_URL}/cosmwasm/wasm/v1/contract/${contractAddr}` +
      `/smart/${Buffer.from(input).toString('base64')}`;
    let resData;
    await axios.get(url)
      .then(res => {
        resData = res.data;
      }).catch(err => {
        resData = {
          error: 1,
          status: err.response?.status,
          data: err.response?.data
        }
      });
    return resData;
  }

  async isWhiteListed (contractAddr, executor) {
    const input = JSON.stringify({
      get_executor: {
        pubkey: executor
      }
    })
    const url = `${config.LCD_URL}/cosmwasm/wasm/v1/contract/${contractAddr}` +
      `/smart/${Buffer.from(input).toString('base64')}`;
    let resData;
    await axios.get(url)
      .then(res => {
        if (res.data?.data?.is_active) {
          return resData = true;
        }
        return resData = {
          error: 1,
          status: res.status,
          data: res.data,
          message: "Cannot verify executor"
        }
      }).catch(err => {
        return resData = false;
      });
    return resData;
  }

  verifySignature (bufferMessage, signature, pubkey) {
    // on contract, when parsing from hex string to bytes it uses from utf8 func (ascii)
    const hashedSig = sha256.update(bufferMessage).digest();
    const bufferHashedSig = Uint8Array.from(hashedSig);    
    return secp256k1.ecdsaVerify(signature, bufferHashedSig, pubkey);
  }
}
