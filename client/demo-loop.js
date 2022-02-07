const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env") })

const { execute } = require('./cosmjs');

const demo = async () => {
    const contractAddr = process.env.CONTRACT_ADDRESS;
    const wallet = process.env.MNEMONIC;
    const threshold = process.env.THRESHOLD || 1;
    const service = process.env.SERVICE || "price";
    const amount = process.env.SENT_FUNDS || "4";
    const denom = "orai";
    const input = JSON.stringify({
        request: {
            threshold: parseInt(threshold),
            service
        }
    })

    // store the merkle root on-chain
    const txHash = await execute({ mnemonic: wallet, address: contractAddr, handleMsg: input, gasData: { gasAmount: "0", denom: "orai" }, amount: [{ amount: String(amount), denom }] });
    console.log("execute result: ", txHash);
}

const start = async () => {
    while (true) {
        try {
            await demo();
        } catch (error) {
            console.log("error: ", error);
        }
        await new Promise(r => setTimeout(r, 2000));
    }
}

start();