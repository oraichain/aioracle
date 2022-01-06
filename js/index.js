const fetch = require('isomorphic-fetch');
const path = require('path');
const { getCurrentStage, submitReport, getRoot, getServiceContracts, checkSubmit } = require('./utils');
require('dotenv').config({ path: path.resolve(__dirname, process.env.NODE_ENV ? `../.env.${process.env.NODE_ENV}` : "../.env") })
const { getFirstWalletAddr, isSignatureSubmitted, getData, getFirstWalletPubkey, signSubmitSignature } = require('./cosmjs');
const { getProofs, verifyLeaf } = require('./merkle-tree');

// run interval to ping, default is 5000ms block confirmed
const handleCurrentRequest = async (interval = 5000) => {
    let isNew = false;
    let currentRequest = 0;
    let leaf = {};
    const mnemonic = process.env.MNEMONIC;
    const executor = await getFirstWalletPubkey(mnemonic);
    const contractAddr = process.env.CONTRACT_ADDRESS;
    console.log("executor: ", executor);

    while (true) {
        try {
            let requestId = await getCurrentStage(contractAddr);
            console.log("requestId id: ", requestId);
            // if current requestId is the same, we check if already submitted successfully. If yes then verify proof & sign
            if (currentRequest === requestId) {
                isNew = false;
                // if have not submitted => retry
                let { submitted } = await checkSubmit(contractAddr, requestId, executor);
                console.log("check submit: ", submitted);
                if (!submitted) {
                    await submitReport(leaf);
                }
                // verify proof
                const { proofs, root } = await getProofs(leaf);
                // no need to verify if there is no proof for this leaf
                if (!proofs) continue;
                const isVerified = await verifyLeaf(contractAddr, requestId, leaf, proofs);
                console.log("is verified with leaf: ", isVerified);
                // only submit signature when verified & when not submit signature
                // check if already submit signature
                const isSubmittedSignature = await isSignatureSubmitted(contractAddr, requestId, executor);
                console.log("is signature submitted: ", isSubmittedSignature);
                if (isVerified && isVerified.data && isSubmittedSignature && !isSubmittedSignature.data) {
                    // submit signature
                    const result = await signSubmitSignature(mnemonic, contractAddr, requestId, root);
                    console.log("update signature result: ", result);
                }
            } else {
                // otherwise we submit report
                isNew = true;
                currentRequest = requestId;
                // get service contracts to get data
                let serviceContracts = await getServiceContracts(contractAddr, requestId);
                let { data, rewards } = await getData(contractAddr, requestId, serviceContracts.oscript);
                leaf = {
                    executor,
                    data,
                    rewards
                }
                console.log("leaf base64: ", Buffer.from(JSON.stringify(leaf)).toString('base64'));
                await submitReport(leaf);
            }

        } catch (error) {
            console.log(error);
        }
        await new Promise(r => setTimeout(r, interval));
    }
};

handleCurrentRequest(1000);