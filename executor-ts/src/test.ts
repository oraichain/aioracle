import * as fetch from 'isomorphic-fetch';
import * as _ from 'lodash';
import config from './config';
import { AES, enc } from 'crypto-js';
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { stringToPath } from '@cosmjs/crypto';
import { GasPrice } from '@cosmjs/stargate';
import {mnemonicToSeedSync} from 'bip39';
import BIP32Factory, { BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import {createHash} from 'crypto';
import {createInterface} from 'readline';
import { collectPin } from './utils/prompt';
import { queryWasmRaw, queryWasm } from './utils/cosmjs';
import { queryTestCases } from './utils/query-testcase';
import { spawn, execSync } from 'child_process';
import { getRequest, getStageInfo } from './utils/common';
import * as WebSocket from 'ws';
import { getData } from './utils/script-execute';
import { RequestStageResponse } from './dtos';

const c = 'orai1s60a2vntfuv2ps6fs75fcrlrmea9xzr4k65zlg';
const ct = 'orai1thf5ppdz59am9sr65tm46hw6fu83lau0v8pga8';
const requestId = 21624;
(async() => {
  // const a = await queryWasm(c, JSON.stringify({
  //   request: {
  //     stage: 21624
  //   }
  // }));
  // const request = await getRequest(c, requestId);
  // console.log(111111, request);
  // const resultGetdata = await getData(c, requestId, request.input);
  // console.log(222222, resultGetdata);

  let result: RequestStageResponse = await queryWasm(c, JSON.stringify({
    request: {
      stage: requestId
    }
  }));
  console.log(result);

})();

// console.log(1111);
// console.log(wss);
// console.log(222222);
// console.log(GasPrice);
