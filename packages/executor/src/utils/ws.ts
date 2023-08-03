import * as WebSocket from 'ws';
import config from '../config';
import { logError } from './logs';
import { processRequest } from './process-request';

export const wsClientConnect = (mnemonic: string) => {
  const ws = new WebSocket(`${config.WEBSOCKET_URL}/websocket`, { handshakeTimeout: 10000 });
  ws.on('open', function open() {
    ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'subscribe',
        params: [`tm.event='Tx' AND wasm.action = 'handle_request'`],
        id: 1
      })
    );
  });

  ws.on('message', async function incoming(data: any) {
    try {
      const result = JSON.parse(data).result;
      if (
        !result || // 👈 null and undefined check
        (Object.keys(result).length === 0 && result.constructor === Object)
      ) {
        return;
      }
      const events = result.events;
      console.log('events: ', events);
      const requestId = events['wasm.stage'];
      console.log('request id: ', requestId);
      console.log('event contract addr: ', events['wasm._contract_address'][0]);
      if (events['execute._contract_address'][0] === config.CONTRACT_ADDRESS) {
        // optional await or running background, no need to pass param
        processRequest(parseInt(requestId), mnemonic);
      }
    } catch (error) {
      logError(error, 'error socket message');
    }
  });

  ws.on('error', (error) => {
    logError(error, 'error socket on ');
    ws.close(1005, JSON.stringify(error));
  });

  ws.on('close', (error) => {
    console.error('\x1b[31m%s\x1b[0m', 'on close error code: ', error);
    setTimeout(function () {
      console.log('\x1b[32m%s\x1b[0m', '\nThe Oracle Runner is reconnecting ...\n');
      wsClientConnect(mnemonic);
    }, 5000);
  });
};
