const path = require('path');
const fetch = require('isomorphic-fetch');
require('dotenv').config({ path: path.resolve(__dirname, process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env") })

const { execute } = require('./cosmjs');
const { report } = require('process');

const demo = async () => {
    const contractAddr = process.env.CONTRACT_ADDRESS;
    const wallet = process.env.MNEMONIC;
    const threshold = process.env.THRESHOLD || 1;
    const service = process.env.SERVICE || "price";
    const lcdUrl = process.env.LCD_URL || "https://testnet-lcd.orai.io";
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    const input = JSON.stringify({
        request: {
            threshold: parseInt(threshold),
            service,
        }
    })
    console.log("input: ", input)

    // store the merkle root on-chain
    const txHash = await execute({ mnemonic: wallet, address: contractAddr, handleMsg: input, gasData: { gasAmount: "0", denom: "orai" } });
    console.log("execute result: ", txHash);
}

const collectRequestId = async (lcdUrl, txHash) => {
    let requestId = -1;
    let count = 0; // break the loop flag
    let hasRequestId = true;
    do {
        hasRequestId = true;
        try {
            const result = await fetch(`${lcdUrl}/cosmos/tx/v1beta1/txs/${txHash}`).then(data => data.json());
            const wasmEvent = result.tx_response.events.filter(event => event.type === "wasm")[0].attributes.filter(attr => attr.key === Buffer.from('stage').toString('base64'))[0].value;
            requestId = Buffer.from(wasmEvent, 'base64').toString('ascii');
        } catch (error) {
            hasRequestId = false;
            count++;
            if (count > 10) break; // break the loop and return the request id.
            // sleep for a few seconds then repeat
            await new Promise(r => setTimeout(r, 3000));
        }
    } while (!hasRequestId);
    return requestId;
}

const collectReports = async (url, contractAddr, requestId) => {
    let count = 0;
    let reports = {};
    do {
        try {
            reports = await fetch(`${url}/report/reports?contract_addr=${contractAddr}&request_id=${requestId}`).then(data => data.json());
            if (!reports.data) throw "error";
        } catch (error) {
            count++;
            if (count > 15) break; // break the loop and return the request id.
            // sleep for a few seconds then repeat
            await new Promise(r => setTimeout(r, 5000));
        }

    } while (!reports.data);
    return reports.data;
}

const start = async () => {
    while (true) {
        try {
            await demo();
        } catch (error) {
            console.log("error: ", error);
        }
        await new Promise(r => setTimeout(r, process.env.LOOP_INTERVAL));
    }
}

start();