const path = require('path');
const fs = require('fs');
const { getStageInfo, submitReport, getServiceContracts, checkSubmit, initStage } = require('./utils');
require('dotenv').config({ path: path.resolve(__dirname, process.env.NODE_ENV ? `../.env.${process.env.NODE_ENV}` : "../.env") })
const { isSignatureSubmitted, getData, getFirstWalletPubkey, signSubmitSignature } = require('./cosmjs');
const { getProofs, verifyLeaf } = require('./merkle-tree');

// run interval to ping, default is 5000ms block confirmed
const handleCurrentRequest = async (interval = 5000) => {

    const mnemonic = process.env.MNEMONIC;
    const executor = await getFirstWalletPubkey(mnemonic);
    const contractAddr = process.env.CONTRACT_ADDRESS;
    console.log("executor: ", executor);
    const stageInfoFile = `stage-info-${executor}.json`;
    const stageInfoPath = path.join(__dirname, stageInfoFile);

    let isNew = false;
    let currentRequest = 0;
    let leaf = {};
    let { requestId, latestStage } = await initStage(stageInfoPath, contractAddr);

    while (true) {
        try {
            // old latest stage, need to get updated
            if (requestId > latestStage) {
                let { checkpoint, latest_stage } = await getStageInfo(contractAddr);
                requestId = checkpoint;
                latestStage = latest_stage;
                let stageInfo = JSON.parse(fs.readFileSync(stageInfoPath, 'utf-8'));
                // only write to file when stage info is different from local
                if (stageInfo.checkpoint !== checkpoint || stageInfo !== latest_stage) {
                    // store new stage info into json
                    fs.writeFile(stageInfoPath, JSON.stringify({ checkpoint, latest_stage }), 'utf8', (err, data) => {
                        if (err) {
                            console.log("error writing file: ", error);
                            return;
                        }
                    });
                }
                if (requestId > latestStage) throw "No request to handle";
            }
            console.log("request id: ", requestId);
            // if current requestId is the same, we check if already submitted successfully. If yes then verify proof & sign
            if (currentRequest === requestId) {
                isNew = false;
                // if have not submitted => retry
                let { submitted } = await checkSubmit(contractAddr, requestId, executor);
                console.log("check submit: ", submitted);
                if (!submitted) {
                    await submitReport(requestId, leaf);
                }
                // verify proof
                const { proofs, root } = await getProofs(requestId, leaf);
                // no need to verify if there is no proof for this leaf
                if (!proofs) continue;
                const isVerified = await verifyLeaf(contractAddr, requestId, leaf, proofs);
                console.log("is verified with leaf: ", isVerified);
                // only submit signature when verified & when not submit signature
                // check if already submit signature
                const isSubmittedSignature = await isSignatureSubmitted(contractAddr, requestId, executor);
                console.log("is signature submitted: ", isSubmittedSignature);
                // if signature already submitted => increment request id
                if (isVerified && isVerified.data && isSubmittedSignature && !isSubmittedSignature.data) {
                    // submit signature
                    const result = await signSubmitSignature(mnemonic, contractAddr, requestId, root);
                    console.log("update signature result: ", result);
                    // if signature is submitted successfully => move to new stages without waiting for others
                    if (result) requestId++;
                }
                else if (isSubmittedSignature && isSubmittedSignature.data) requestId++;
            } else {
                // TODO: need to always check submit before doing anything. If already submitted => get report from db instead of the fetching new one
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
                await submitReport(requestId, leaf);
            }

        } catch (error) {
            console.log(error);
        }
        await new Promise(r => setTimeout(r, interval));
    }
};

handleCurrentRequest(1000);