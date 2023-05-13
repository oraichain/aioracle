const path = require('path');
const fetch = require('isomorphic-fetch');
require('dotenv').config({ path: path.resolve(__dirname, process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env") })

const { execute } = require('./cosmjs');

const demo = async () => {
    const contractAddr = process.env.CONTRACT_ADDRESS;
    console.log("contract addr: ", contractAddr)
    const wallet = process.env.MNEMONIC;
    const threshold = process.env.THRESHOLD || 1;
    const service = process.env.SERVICE || "price";
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    // store the merkle root on-chain
    const result = await execute({
        mnemonic: wallet,
        address: contractAddr,
        handleMsg: {
            request: {
                threshold: parseInt(threshold),
                service,
            }
        },
    });
    console.log("Request tx result: ", result);
    console.dir(result, { depth: null });
    const requestId = result.events.find(event => event.type === 'wasm').attributes.find(attr => attr.key === 'stage').value;
    const reports = await collectReports(backendUrl, contractAddr, requestId, threshold);
    console.log("reports: ");
    console.dir(reports, { depth: null });
}

const collectReports = async (url, contractAddr, requestId, threshold) => {
    let count = 0;
    let reports = {};
    do {
        try {
            reports = await fetch(`${url}/report/reports?contract_addr=${contractAddr}&request_id=${requestId}`).then(data => data.json());
            console.log("reports: ", reports)
            if (!reports.data || reports.data.data.length < threshold) throw "error";
        } catch (error) {
            count++;
            if (count > 100) break; // break the loop and return the request id.
            // sleep for a few seconds then repeat
            await new Promise(r => setTimeout(r, 5000));
        }

    } while (!reports.data || reports.data.data.length < threshold);
    return reports.data;
}

demo();