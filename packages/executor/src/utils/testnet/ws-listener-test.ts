import WebSocket from 'ws';
import config from '../../config';

const connect = () => {
  const ws = new WebSocket(`ws://${config.WS_HOST}:${config.WS_PORT}/websocket`, { handshakeTimeout: 10000 });
  ws.on('open', function open() {
    console.log('successfully connected');
  });

  ws.on('message', async function incoming(data: any) {
    console.log('received data: ', JSON.parse(data));
  });
};

connect();
