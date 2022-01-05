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

const handleResponse = (res, status, message) => {
    return res.status(status).send({ message })
}

module.exports = { getRoot, getCurrentStage, handleResponse };