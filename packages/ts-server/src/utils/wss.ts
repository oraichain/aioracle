import WebSocket, { WebSocketServer } from 'ws';
import config from 'src/config';

export default class WSS {
  static _self: WSS;
  private wss;

  constructor() {
    this.wss = new WebSocketServer({
      host: config.WS_HOST,
      port: config.WS_PORT
    });
    console.log('init socket successs');
    WSS._self = this;
  }

  static getInstance() {
    if (!WSS._self) {
      WSS._self = new WSS();
    }
    return WSS._self;
  }

  broadcastMerkleRoot (requestData) {
    let count = 0;
    this.wss
      .clients
      .forEach(client => {
        count++;
        client.send(JSON.stringify(requestData));
      });
    console.log('websocket send client: ', count);
  }

  isConnect() {
    this.wss.on('connection', (webSocketClient) => {
      webSocketClient.on('message', function message(data) {
        console.log('received: %s', data);
      });
      webSocketClient.send('{ "connection" : "ok"}');
    });
  }
}
