const path = require('path');
const { execute } = require('./cosmjs');
const getProofs = require('./get-proof');
require('dotenv').config({ path: path.resolve(__dirname, process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env") })

const requestId = 320;

const claim = async () => {
    const contractAddr = process.env.CONTRACT_ADDRESS;
    const wallet = process.env.MNEMONIC;

    const listProofs = await getProofs(requestId, contractAddr);
    console.log("proofs: ", listProofs);
    for (let proofData of listProofs) {
        const reportBin = Buffer.from(JSON.stringify(proofData.finalReport)).toString('base64');

        const input = JSON.stringify({
            claim_reward: {
                stage: requestId,
                report: reportBin,
                proof: proofData.proofs.proofs
            }
        })
        console.log("input: ", input)

        // store the merkle root on-chain
        const txHash = await execute({ mnemonic: wallet, address: contractAddr, handleMsg: input, gasData: { gasAmount: "0", denom: "orai" }, amount: [{ amount: String(1), denom: "orai" }] });

        console.log("tx hash claim: ", txHash);
    }
}

claim();