const crypto = require('crypto');
const sha256 = (data) => crypto.createHash('sha256').update(data).digest();

const getProofs = async (requestId, leaf) => {
    let result = {};
    let count = 0;
    let finalLeaf = { ...leaf, data: sha256(leaf.data).toString('hex') };
    do {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': "application/json"
            },
            body: JSON.stringify({ requestId, leaf: finalLeaf }),
            redirect: 'follow'
        };
        result = await fetch("http://localhost:3000/get_proof", requestOptions).then(data => data.json());
        // sleep for 5 seconds then repeat. Break after 10 tries
        await new Promise(r => setTimeout(r, 5000));
        count++;
        if (count > 10) break;
    } while (!result.proofs);
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
    return fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json())
}

module.exports = { getProofs, verifyLeaf }