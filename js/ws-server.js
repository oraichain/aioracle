// ws server config to broadcast merkle root
const WebSocket = require('ws');
const { env } = require('./config');
const wss = new WebSocket.Server({ port: env.WS_PORT, host: env.WS_HOST });

const boradcastExecutorResult = (executorResult) => {
    // send msgs to ws server.
    wss
        .clients
        .forEach(client => {
            //send the client the current message
            client.send(JSON.stringify(executorResult));
        });
}

module.exports = { boradcastExecutorResult };