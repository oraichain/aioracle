const fetch = require('isomorphic-fetch');
const path = require('path');
const { getCurrentStage } = require('../js-server/utils');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const data = require('../testdata/report_list.json');

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

const verifyLeaf = async (leaf, proofs) => {
    const input = JSON.stringify({
        verify_data: {
            stage: parseInt(data[0].request_id),
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
    while (true) {
        try {
            let request = await getCurrentStage();
            console.log("request id: ", request);
            // if current request is the same, we check if already submitted successfully. If yes then verify proof & sign
            if (currentRequest === request) {
                isNew = false;
                // TODO: query submitted report

                // verify proof
                const proofs = await getProofs(leaf);
                const isVerified = await verifyLeaf(leaf, proofs);
                console.log("is verified with leaf: ", isVerified);
                // sign merkle root if not already signed
            } else {
                // otherwise we submit report
                isNew = true;
                currentRequest = request;
                // TODO: use correct input format
                leaf = { "something": "abc" };
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