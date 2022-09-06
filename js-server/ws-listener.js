const WebSocket = require('ws');
const { env } = require('./config');

const connect = () => {
    const ws = new WebSocket(`ws://${env.WS_HOST}:${env.WS_PORT}/websocket`, { handshakeTimeout: 10000 });
    ws.on('open', function open() {
    });

    ws.on('message', async function incoming(data) {
        console.log("received data: ", JSON.parse(data));
    });
}

connect();