const crypto = require('crypto');
const sha256 = (data) => crypto.createHash('sha256').update(data).digest();
const { config } = require('./config');
require('dotenv').config(config)

const lcdUrl = process.env.LCD_URL || "https://testnet-lcd.orai.io";
const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

const getProofs = async (requestId, leaf) => {
    let result = {};
    let finalLeaf = { ...leaf, data: sha256(leaf.data).toString('hex') };
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': "application/json"
        },
        body: JSON.stringify({ requestId, leaf: finalLeaf }),
        redirect: 'follow'
    };
    result = await fetch(`${backendUrl}/report-info/get-proof`, requestOptions).then(data => data.json());
    // sleep for 5 seconds then repeat. Break after 10 tries
    return result;
}

const verifyLeaf = async (contractAddr, requestId, leaf, proofs) => {
    let finalLeaf = { ...leaf, data: sha256(leaf.data).toString('hex') };
    console.log("leaf to verify: ", JSON.stringify(finalLeaf));
    const input = JSON.stringify({
        verify_data: {
            stage: parseInt(requestId),
            data: Buffer.from(JSON.stringify(finalLeaf)).toString('base64'),
            proof: proofs
        }
    })
    return fetch(`${lcdUrl}/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json())
}

module.exports = { getProofs, verifyLeaf }