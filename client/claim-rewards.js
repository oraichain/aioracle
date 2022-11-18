const path = require('path');
const { getFirstWalletPubkey, execute } = require('./cosmjs');
const { handleFinishedReports, updateClaim } = require('./get-proof');
const oraiwasmJs = require('./wasmjs');
require('dotenv').config({ path: path.resolve(__dirname, process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env") })

const claim = async () => {

    const contractAddr = process.env.CONTRACT_ADDRESS;
    const wallet = process.env.MNEMONIC;
    const executor = await getFirstWalletPubkey(wallet);
    console.log("executor: ", executor)

    const listProofs = await handleFinishedReports(executor, contractAddr);

    const inputs = [];
    for (let proofData of listProofs) {
        const reportBin = Buffer.from(JSON.stringify(proofData.finalReport)).toString('base64');

        const input = Buffer.from(JSON.stringify({
            claim_reward: {
                stage: proofData.requestId,
                report: reportBin,
                proof: proofData.proofs.proofs
            }
        }));
        inputs.push(input)
    }

    const msgs = inputs.map(input => ({ contractAddr, message: input }));

    // store the merkle root on-chain
    try {
        // old version
        // const executeResult = await oraiwasmJs.execute({ childKey: oraiwasmJs.getChildKey(wallet), rawInputs: msgs, gasLimits: 2000000, broadcastMode: 'BROADCAST_MODE_BLOCK' });
        const executeResult = await execute({
          mnemonic: wallet,
          address: contractAddr, 
          handleMsg: msgs, 
          gasData: { gasAmount: "0", denom: "orai" }
        })
        console.log("execute result: ", executeResult);
        const data = listProofs.map(proof => ({ executor, request_id: proof.requestId }));

        // update claim to true to mark claim as true
        const claimResult = await updateClaim(data, contractAddr);
        console.log("claim result: ", claimResult);
    } catch (error) {
        console.log("error: ", error)
    }

}

claim();