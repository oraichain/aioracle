const fetch = require('isomorphic-fetch');
const path = require('path');
const { getCurrentStage } = require('../js-server/utils');
require('dotenv').config({ path: path.resolve(__dirname, process.env.NODE_ENV ? `../.env.${process.env.NODE_ENV}` : "../.env") })
const data = require('../testdata/report_list.json');
const { execute } = require('./cosmjs');

const submitReport = async (leaf) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': "application/json"
        },
        body: JSON.stringify(leaf),
        redirect: 'follow'
    };
    const result = await fetch("http://localhost:3000/submit_report", requestOptions).then(data => data.json());
    console.log("result: ", result);
}

const getProofs = async (leaf) => {
    let result = {};
    let count = 0;
    do {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': "application/json"
            },
            body: JSON.stringify(leaf),
            redirect: 'follow'
        };
        result = await fetch("http://localhost:3000/get_proof", requestOptions).then(data => data.json());
        // sleep for 5 seconds then repeat. Break after 10 tries
        await new Promise(r => setTimeout(r, 5000));
        count++;
        if (count > 10) break;
    } while (!result.proofs);
    return result.proofs;
}

const submitSignature = async (contractAddr, stage, signature) => {
    return execute({ mnemonic: process.env.MNEMONIC, address: contractAddr, handleMsg: JSON.stringify({ update_signature: { stage, signature } }), gasData: { gasAmount: "0", denom: "orai" } });
}

const verifyLeaf = async (requestId, leaf, proofs) => {
    const input = JSON.stringify({
        verify_data: {
            stage: parseInt(requestId),
            data: JSON.stringify(leaf),
            proof: proofs
        }
    })
    return fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${process.env.CONTRACT_ADDRESS}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json())
}

// run interval to ping, default is 5000ms block confirmed
const handleCurrentRequest = async (interval = 5000) => {
    let isNew = false;
    let currentRequest = 0;
    let leaf = {};
    const executor = process.env.EXECUTOR;
    const contractAddr = process.env.CONTRACT_ADDRESS;
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
                let checkSubmit = await fetch(`http://localhost:3000/check_submit?request_id=${request}&executor=${executor}`, requestOptions).then(data => data.json());
                console.log("check submit: ", checkSubmit);
                if (!checkSubmit.submitted) {
                    await submitReport(leaf);
                }
                // verify proof
                const proofs = await getProofs(leaf);
                // no need to verify if there is no proof for this leaf
                if (proofs.length === 0) continue;
                const isVerified = await verifyLeaf(request, leaf, proofs);
                console.log("is verified with leaf: ", isVerified);
                // only submit signature when verified & when not submit signature
                // TODO: add check if already submit signature
                if (isVerified && isVerified.data) {
                    // submit signature
                    const result = await submitSignature(contractAddr, request, "something");
                    console.log("update signature result: ", result);
                }
            } else {
                // otherwise we submit report
                isNew = true;
                currentRequest = request;
                // TODO: use correct input format
                leaf = data[0];
                leaf.executor = executor;
                await submitReport(leaf);
            }

        } catch (error) {
            console.log('error while handling current request: ', error);
        }
        await new Promise(r => setTimeout(r, interval));
    }
};

const start = async () => {
    await submitReport();
    // setInterval(queryReportVerify, 5000);
    try {
        const proofs = await getProofs();
        const leaf = data[0];
        console.log("proofs: ", proofs);

        // verify leaf
        const isVerified = await verifyLeaf(leaf, proofs);
        console.log("is verified with leaf: ", isVerified);
    } catch (error) {
        console.log("error when start: ", error);
    }
}

// start();

handleCurrentRequest(5000);