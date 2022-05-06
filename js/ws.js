const { env } = require('./config');
const WebSocket = require('ws');
const { processRequest } = require('./process-request');
const { writeErrorMessage } = require('./utils');
const fs = require('fs');
const writeStream = fs.createWriteStream(process.cwd() + '/debug.log', {
    flags: 'a+'
});

const connect = (mnemonic) => {
    const ws = new WebSocket(`${env.WEBSOCKET_URL}/websocket`, { handshakeTimeout: 10000 });
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

    ws.on('message', async function incoming(data) {
        try {
            const result = JSON.parse(data).result;
            if (
                result && // 👈 null and undefined check
                (Object.keys(result).length !== 0 ||
                    result.constructor !== Object)
            ) {
                const events = result.events;
                console.log('events: ', events);
                const requestId = events['wasm.stage'];
                console.log("request id: ", requestId);
                console.log("event contract addr: ", events['wasm.contract_address'][0])
                if (events['wasm.contract_address'][0] === env.CONTRACT_ADDRESS) processRequest(parseInt(requestId), mnemonic);
            }
        } catch (error) {
            writeStream.write(writeErrorMessage(error), (err) => {
                if (err) console.log("error when appending error to log file: ", err);
            })
        }
    });

    ws.on('error', (error) => {
        console.error("on error: ", error);
        writeStream.write(writeErrorMessage(error), (err) => {
            if (err) console.log("error when appending error to log file: ", err);
        })
        ws.close(1005, JSON.stringify(error))
    })

    ws.on('close', (error) => {
        console.error('\x1b[31m%s\x1b[0m', "on close error code: ", error);
        setTimeout(function () {
            console.log('\x1b[32m%s\x1b[0m', "\nThe Oracle Runner is reconnecting ...\n");
            connect(mnemonic);
        }, 5000);
    })
}

module.exports = connect;