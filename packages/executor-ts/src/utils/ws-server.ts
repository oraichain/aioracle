import { Server } from 'ws';
import config from '../config';

const wss = new Server({ port: config.WS_PORT, host: config.WS_HOST });

export const boradcastExecutorResult = (executorResult: any) => {
  // send msgs to ws server.
  wss
    .clients
    .forEach(client => {
        //send the client the current message
        client.send(JSON.stringify(executorResult));
    });
};
