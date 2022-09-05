const WebSocket = require('ws');

const connect = () => {
    const ws = new WebSocket(`ws://localhost:7071/websocket`, { handshakeTimeout: 10000 });
    ws.on('open', function open() {
    });

    ws.on('message', async function incoming(data) {
        console.log("received data: ", JSON.parse(data));
    });
}

connect();