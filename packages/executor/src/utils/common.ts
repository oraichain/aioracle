import * as fetch from 'isomorphic-fetch';
import * as _ from 'lodash';
import { mnemonicToSeedSync } from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import config from 'src/config';
import { signSignature } from './crypto';
import { handleFetchResponse } from './cosmjs';
import { broadcastExecutorResult } from './ws-server';
import { Leaf, MessageSign, PostMessage, ReportSubmittedResponse } from 'src/dtos';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { spawn } from 'child_process';

const bip32 = BIP32Factory(ecc);

export const checkSubmit = async (contractAddr: string, requestId: number, executor: string): Promise<ReportSubmittedResponse> => {
  return fetch(`${config.BACKEND_URL}/report/submitted?contract_addr=${contractAddr}&request_id=${requestId}&executor=${executor}`).then((data) => handleFetchResponse(data));
};

export const generateWalletFromMnemonic = (mnemonic: string, path = config.path, password = '') => {
  const seed = mnemonicToSeedSync(mnemonic, password);
  const masterKey = bip32.fromSeed(seed);
  const hd = masterKey.derivePath(path);

  const privateKey = hd.privateKey;
  if (!privateKey) {
    throw new Error('null hd key');
  }
  return privateKey;
};

export const submitReport = async (requestId: number, leaf: Leaf, wallet: DirectSecp256k1HdWallet) => {
  const account = (await wallet.getAccounts())[0];
  const pubKey = account.pubkey;
  const privateKey = generateWalletFromMnemonic(wallet.mnemonic, config.path);
  const messageSign: MessageSign = { requestId, report: leaf };
  const signature = Buffer.from(signSignature(Buffer.from(JSON.stringify(messageSign), 'ascii'), privateKey, pubKey)).toString('base64');

  const message: PostMessage = {
    request_id: requestId,
    report: { ...leaf, signature }
  };
  const requestOptions = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message),
    redirect: 'follow' as RequestRedirect
  };

  // before submiting to the backend, we fire the message's data into the websocket so listeners can listen
  broadcastExecutorResult(message);

  // submit data to the backend for aggregation
  const result = await fetch(`${config.BACKEND_URL}/report`, requestOptions).then((data) => handleFetchResponse(data));
  console.log('result submitting report: ', result);
  console.log('Successful submission time: ', new Date().toUTCString());
};

export const spawnPromise = async (cmd: string, args: readonly string[], currentDir?: string, env?: NodeJS.ProcessEnv) => {
  const proc = spawn(cmd, args, { env: { ...process.env, ...env }, cwd: currentDir });
  return await new Promise((resolve, reject) => {
    const data = [];
    const errData = [];
    proc.stdout.on('data', (buf) => {
      data.push(buf.toString());
    });
    proc.stderr.on('data', (buf) => {
      const dataStr = buf.toString();
      // Deno will push its log to err stream.
      // Most common logs include download & check module imports.
      // Otherwise, we reject err
      if (!dataStr.includes('Download') && !dataStr.includes('Check')) {
        console.log('data in error process deno: ', dataStr);
        errData.push(dataStr);
      }
    });
    proc.on('close', (code) => {
      resolve({ code, data: data.join('\n'), error: errData.join('\n') });
    });
    proc.on('error', reject);
  });
};
