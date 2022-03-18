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
    const [feeAmount, boundExecutorFee] = await getServiceFees(contractAddr, lcdUrl, service, threshold);
    let finalFeeAmount = feeAmount.filter(fee => fee.amount !== '0');
    if (finalFeeAmount.length === 0) finalFeeAmount = undefined;
    const input = JSON.stringify({
        request: {
            threshold: parseInt(threshold),
            service,
            preference_executor_fee: boundExecutorFee
        }
    })
    console.log("input: ", input)

    // store the merkle root on-chain
    const txHash = await execute({ mnemonic: wallet, address: contractAddr, handleMsg: input, gasData: { gasAmount: "0", denom: "orai" }, amount: finalFeeAmount });
    console.log("execute result: ", txHash);
}

const getServiceFees = async (contractAddr, lcdUrl, service, threshold) => {
    const getServiceFeesMsg = JSON.stringify({
        get_service_fees: {
            service,
        }
    })
    const boundExecutorFeeMsg = JSON.stringify({
        get_bound_executor_fee: {}
    })
    let { data } = await fetch(`${lcdUrl}/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(getServiceFeesMsg).toString('base64')}`).then(data => data.json());
    let boundFee = await fetch(`${lcdUrl}/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(boundExecutorFeeMsg).toString('base64')}`).then(data => data.json());
    let boundExecutorFee = boundFee.data;
    data.push(["placeholder", boundExecutorFee.denom, boundExecutorFee.amount]);
    // let data = [
    //     ['orai1y88tlgddntj66sn46qqlvtx3tp7tgl8sxxx6uk', 'orai', '1'],
    //     ['orai1v7ae3ptzqvztcx83fheafltq88hvdp2m5zas6f', 'orai', '1'],
    //     ['orai1v7ae3ptzqvztcx83fheafltq88hvdp2m5zas6f', 'foobar', '1'],
    //     ['orai1v7ae3ptzqvztcx83fheafltq88hvdp2m5zas6f', 'orai', '1'],
    //     ['orai1v7ae3ptzqvztcx83fheafltq88hvdp2m5zas6f', 'orai', '1'],
    //     ['orai1v7ae3ptzqvztcx83fheafltq88hvdp2m5zas6f', 'xyz', '1'],
    //     ['orai1v7ae3ptzqvztcx83fheafltq88hvdp2m5zas6f', 'foobar', '1'],
    //     ['orai1v7ae3ptzqvztcx83fheafltq88hvdp2m5zas6f', 'xyz', '1'],
    // ];
    data = data.map(reward => ({ denom: reward[1], amount: parseInt(reward[2]) })).reduce((prev, curr) => {
        if (prev.constructor === Array) {
            // find if the current denom exists already in the accumulator
            const index = prev.findIndex(prevElement => prevElement.denom === curr.denom);
            if (index !== -1) {
                // if exist then we update the amount of the index in the accumulator, then keep the accumulator 
                prev[index].amount += curr.amount;
                return prev;
            }
            // if does not exist then we append the current obj into the accumulator
            return [...prev, curr];
        } else {
            if (prev.denom === curr.denom) return [{ ...prev, amount: prev.amount + curr.amount }];
        }
        return [...prev, curr];
    }, []).map(reward => ({ ...reward, amount: String(reward.amount * threshold) }));
    return [data, boundExecutorFee];
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