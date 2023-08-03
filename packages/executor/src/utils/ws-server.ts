import { Server } from 'ws';
import config from '../config';
import { PostMessage } from '../dtos';

const wss = new Server({ port: config.WS_PORT, host: config.WS_HOST });

export const broadcastExecutorResult = (executorResult: PostMessage) => {
  // send msgs to ws server.
  wss.clients.forEach((client) => {
    //send the client the current message
    client.send(JSON.stringify(executorResult));
  });
};
