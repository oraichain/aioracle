const crypto = require('crypto');
const { queryWasmRaw } = require('./cosmjs');
const sha256 = (data) => crypto.createHash('sha256').update(data).digest();

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
    return queryWasmRaw(contractAddr, input);
}

module.exports = { verifyLeaf }