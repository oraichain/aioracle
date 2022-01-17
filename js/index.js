const path = require('path');
const fs = require('fs');
const { getStageInfo, submitReport, getServiceContracts, checkSubmit, initStage, getRequest } = require('./utils');
// set node env config
const { config } = require('./config');
require('dotenv').config(config)
const { isSignatureSubmitted, getData, getFirstWalletPubkey, signSubmitSignature } = require('./cosmjs');
const { getProofs, verifyLeaf } = require('./merkle-tree');

// run interval to ping, default is 5000ms block confirmed
const handleCurrentRequest = async (interval = 5000) => {
    const mnemonic = process.env.MNEMONIC;
    console.log("env: ", process.env.MNEMONIC);
    const executor = await getFirstWalletPubkey(mnemonic);
    const contractAddr = process.env.CONTRACT_ADDRESS;
    console.log("executor: ", executor);
    const stageInfoFile = `stage-info-${executor}.json`;
    const leafFile = `leaf-${executor}.json`
    const stageInfoPath = path.join(process.cwd(), stageInfoFile); // use process pwd instead of __dirname due to config of vercel pkg: https://github.com/vercel/pkg#snapshot-filesystem
    const leafPath = path.join(process.cwd(), leafFile);

    let leaf = {};
    let { requestId, latestStage } = await initStage(stageInfoPath, contractAddr);

    // request error count. If reach above a certain value => skip to next request
    let canSkip = 0;
    let errorRequestId = 0;

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
                    fs.writeFile(stageInfoPath, JSON.stringify({ checkpoint, latest_stage }), 'utf8', (error, data) => {
                        if (error) {
                            console.log("error writing file: ", error);
                            return;
                        }
                    });
                }
                if (requestId > latestStage) {
                    console.log("No request to handle");
                    await new Promise(r => setTimeout(r, interval));
                    continue;
                }
            }
            console.log("Current checkpoint: ", requestId);
            console.log("latest stage: ", latestStage);

            // check if already submit signature. If yes then skip to next round
            const isSubmittedSignature = await isSignatureSubmitted(contractAddr, requestId, executor);
            console.log("is signature submitted: ", isSubmittedSignature);
            if (isSubmittedSignature && isSubmittedSignature.data) {
                requestId++;
                continue;
            }

            // only submit data to backend if not already done so
            let { submitted, report } = await checkSubmit(contractAddr, requestId, executor);
            if (!submitted) {
                // if the request already has merkle root stored => skip this round
                let request = await getRequest(contractAddr, requestId);
                if (request.data && request.data.merkle_root) {
                    requestId++;
                    continue;
                }
                // get service contracts to get data from the scripts, then submit report
                let serviceContracts = await getServiceContracts(contractAddr, requestId);
                let { data, rewards } = await getData(contractAddr, requestId, serviceContracts);
                leaf = {
                    executor,
                    data,
                    rewards
                }
                console.log("leaf base64: ", Buffer.from(JSON.stringify(leaf)).toString('base64'));
                await submitReport(requestId, leaf);
                fs.writeFile(leafPath, JSON.stringify({ requestId, leaf }), 'utf8', (error, data) => {
                    if (error) {
                        console.log("error writing file: ", error);
                        return;
                    }
                });
            } else {
                // read leaf data from json file
                let data = JSON.parse(fs.readFileSync(leafPath, 'utf-8'));
                // if request id doesnt match the current request id that we are handling => must use leaf from db
                if (data.requestId !== requestId) leaf = report;
                else leaf = data.leaf;
            }

            // final case, when have not submitted signature. Need to verify leaf before signing
            const { proofs, root } = await getProofs(requestId, leaf);
            // no need to verify if there is no proof for this leaf
            if (!proofs) continue;
            const isVerified = await verifyLeaf(contractAddr, requestId, leaf, proofs);
            console.log("is verified with leaf: ", isVerified);
            // only submit signature when verified & when not submit signature
            // if signature already submitted => increment request id
            if (isVerified && isVerified.data && isSubmittedSignature && !isSubmittedSignature.data) {
                // submit signature
                const result = await signSubmitSignature(mnemonic, contractAddr, requestId, root);
                console.log("update signature result: ", result);
                // if signature is submitted successfully => move to new stages without waiting for others
                if (result) requestId++;
            }

        } catch (error) {
            console.log("error: ", error);
            if (requestId === errorRequestId) {
                canSkip++;
                if (canSkip > 5) requestId++;
            }
            else {
                // reset error check when new request id
                errorRequestId = requestId;
                canSkip = 0;
            }

        }
        await new Promise(r => setTimeout(r, interval));
    }
};

handleCurrentRequest(1000);