const fetch = require('isomorphic-fetch');
const path = require('path');
const { getCurrentStage, submitReport } = require('./utils');
require('dotenv').config({ path: path.resolve(__dirname, process.env.NODE_ENV ? `../.env.${process.env.NODE_ENV}` : "../.env") })
const { getFirstWalletAddr, submitSignature, isSubmitted, getData } = require('./cosmjs');
const { getProofs, verifyLeaf } = require('./merkle-tree');

// run interval to ping, default is 5000ms block confirmed
const handleCurrentRequest = async (interval = 5000) => {
    let isNew = false;
    let currentRequest = 0;
    let leaf = {};
    const mnemonic = process.env.MNEMONIC;
    const executor = await getFirstWalletAddr(mnemonic);
    const contractAddr = process.env.CONTRACT_ADDRESS;
    console.log("executor: ", executor);

    while (true) {
        try {
            let request = await getCurrentStage(contractAddr);
            console.log("request id: ", request);
            // if current request is the same, we check if already submitted successfully. If yes then verify proof & sign
            if (currentRequest === request) {
                isNew = false;
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': "application/json"
                    },
                    redirect: 'follow'
                };
                // if have not submitted => retry
                let checkSubmit = await fetch(`http://localhost:3000/check_submit?contract_addr=${contractAddr}&request_id=${request}&executor=${executor}`, requestOptions).then(data => data.json());
                console.log("check submit: ", checkSubmit);
                if (!checkSubmit.submitted) {
                    await submitReport(leaf);
                }
                // verify proof
                const proofs = await getProofs(leaf);
                // no need to verify if there is no proof for this leaf
                if (proofs.length === 0) continue;
                const isVerified = await verifyLeaf(contractAddr, request, leaf, proofs);
                console.log("is verified with leaf: ", isVerified);
                // only submit signature when verified & when not submit signature
                // check if already submit signature
                const submitted = await isSubmitted(contractAddr, request, executor);
                console.log("is signature submitted: ", submitted);
                if (isVerified && isVerified.data && submitted && !submitted.data) {
                    // submit signature
                    const result = await submitSignature(mnemonic, contractAddr, request, "something");
                    console.log("update signature result: ", result);
                }
            } else {
                // otherwise we submit report
                isNew = true;
                currentRequest = request;
                // TODO: use correct input format
                leaf = await getData();
                leaf.executor = executor;
                await submitReport(leaf);
            }

        } catch (error) {
            console.log(error);
        }
        await new Promise(r => setTimeout(r, interval));
    }
};

handleCurrentRequest(1000);