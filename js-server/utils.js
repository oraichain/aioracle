const fetch = require('isomorphic-fetch');
const getRoot = async (requestId) => {

    const input = JSON.stringify({
        merkle_root: {
            stage: requestId
        }
    })

    return fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${process.env.CONTRACT_ADDRESS}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
}

module.exports = { getRoot };