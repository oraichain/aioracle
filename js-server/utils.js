const fetch = require('isomorphic-fetch');
const getRoot = async (requestId) => {

    const input = JSON.stringify({
        merkle_root: {
            stage: requestId
        }
    })

    return fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${process.env.CONTRACT_ADDRESS}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
}

const getCurrentStage = async () => {

    const input = JSON.stringify({
        current_stage: {}
    })

    const data = await fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${process.env.CONTRACT_ADDRESS}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
    if (!data.data) {
        throw "No request to handle";
    }
    return data.data.current_stage;
}

module.exports = { getRoot, getCurrentStage };