const fetch = require('isomorphic-fetch');
const getRoot = async (contractAddr, requestId) => {

    const input = JSON.stringify({
        request: {
            stage: requestId
        }
    })

    return fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
}

const getCurrentStage = async (contractAddr) => {

    const input = JSON.stringify({
        current_stage: {}
    })

    const data = await fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
    if (!data.data) {
        throw "No request to handle";
    }
    return data.data.current_stage;
}

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

module.exports = { getRoot, getCurrentStage, submitReport };