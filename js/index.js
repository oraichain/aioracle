const path = require('path');
const fs = require('fs');
const { getStageInfo, submitReport, getServiceContracts, checkSubmit, initStage, getRequest } = require('./utils');
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
    const leafFile = `leaf-${executor}.json`
    const stageInfoPath = path.join(__dirname, stageInfoFile);
    const leafPath = path.join(__dirname, leafFile);

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
                let { data, rewards } = await getData(contractAddr, requestId, serviceContracts.oscript);
                leaf = {
                    executor,
                    data,
                    rewards
                }
                console.log("leaf base64: ", Buffer.from(JSON.stringify(leaf)).toString('base64'));
                await submitReport(requestId, leaf);
                fs.writeFile(leafPath, JSON.stringify({ requestId, leaf }), 'utf8', (err, data) => {
                    if (err) {
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

            // check if already submit signature. If yes then skip to next round
            const isSubmittedSignature = await isSignatureSubmitted(contractAddr, requestId, executor);
            console.log("is signature submitted: ", isSubmittedSignature);
            if (isSubmittedSignature && isSubmittedSignature.data) {
                requestId++;
                continue;
            }

            // verify proof
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
            console.log(error);
        }
        await new Promise(r => setTimeout(r, interval));
    }
};

handleCurrentRequest(1000);