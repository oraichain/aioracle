import { Injectable } from '@nestjs/common';
import { Message, sha256 } from 'js-sha256';
import * as secp256k1 from 'secp256k1';
import config from 'src/config';

import {
  AioracleContractTypes,
  AioracleContractQueryClient,
} from '@oraichain/aioracle-contracts-sdk';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

@Injectable()
export class ExecutorService {
  constructor() {}

  async getRequest(
    contractAddr: string,
    requestId: number,
  ): Promise<AioracleContractTypes.RequestResponse> {
    const client = await CosmWasmClient.connect(config.LCD_URL);
    const queryContract = new AioracleContractQueryClient(client, contractAddr);
    const res = await queryContract.getRequest({ stage: requestId });
    return res;
  }

  async isWhiteListed(
    contractAddr: string,
    executor: string,
  ): Promise<boolean> {
    const input = JSON.stringify({
      check_executor_in_list: {
        address: executor,
      },
    } as AioracleContractTypes.QueryMsg);

    const client = await CosmWasmClient.connect(config.LCD_URL);
    const queryContract = new AioracleContractQueryClient(client, contractAddr);
    const res = await queryContract.checkExecutorInList({ address: executor });
    return res;
  }

  verifySignature(
    bufferMessage: Message,
    signature: Uint8Array,
    pubkey: Uint8Array,
  ) {
    // on contract, when parsing from hex string to bytes it uses from utf8 func (ascii)
    const hashedSig = sha256.update(bufferMessage).digest();
    const bufferHashedSig = Uint8Array.from(hashedSig);
    return secp256k1.ecdsaVerify(signature, bufferHashedSig, pubkey);
  }
}
