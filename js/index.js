const fetch = require('isomorphic-fetch');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const data = require('../testdata/report_list.json');

const submitReport = async () => {
    for (let raw of data) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': "application/json"
            },
            body: JSON.stringify(raw),
            redirect: 'follow'
        };
        const result = await fetch("http://localhost:3000/submit_report", requestOptions).then(data => data.json());
        console.log("result: ", result);
    }
}

const queryReportVerify = async () => {

    // get proof first from server


    const input = JSON.stringify({
        merkle_root: {
            stage: process.env.REQUEST_ID
        }
    })
    const root = await fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${process.env.CONTRACT_ADDRESS}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json()).catch(error => console.log("error: ", error));
}

const getProofs = async () => {
    let result = {};
    let leaf = data[0];
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

start();