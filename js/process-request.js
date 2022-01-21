const { submitReport, getServiceContracts, checkSubmit, initStage, getRequest } = require('./utils');
// set node env config
const { config, env } = require('./config');
const { isSignatureSubmitted, getData, getFirstWalletPubkey, signSubmitSignature, getFirstWalletAddr } = require('./cosmjs');
const { getProofs, verifyLeaf } = require('./merkle-tree');
const signSubmitSignatureCosmosjs = require('./cosmosjs');

const mnemonic = env.MNEMONIC;

const handleSignMerkleRoot = async (requestId, leaf, contractAddr) => {
    // gas for broadcasting
    const gasPrice = env.GAS_PRICE;
    const gasLimits = env.GAS_LIMITS;
    const executor = await getFirstWalletPubkey(mnemonic);

    // check if already submit signature. If yes then skip to next round
    const isSubmittedSignature = await isSignatureSubmitted(contractAddr, requestId, executor);
    console.log("is signature submitted: ", isSubmittedSignature);
    if (isSubmittedSignature && isSubmittedSignature.data) {
        return;
    }

    // final case, when have not submitted signature. Need to verify leaf before signing
    const { proofs, root } = await getProofs(requestId, leaf);
    // no need to verify if there is no proof for this leaf
    if (!proofs) return;
    const isVerified = await verifyLeaf(contractAddr, requestId, leaf, proofs);
    console.log("is verified with leaf: ", isVerified);
    // only submit signature when verified & when not submit signature
    // if signature already submitted => increment request id
    if (isVerified && isVerified.data && isSubmittedSignature && !isSubmittedSignature.data) {
        const result = await signSubmitSignatureCosmosjs(mnemonic, contractAddr, requestId, root, gasPrice, gasLimits);
        console.log("update signature result: ", result);
    }
}

const processRequest = async (requestId) => {
    console.log("request id: ", requestId);
    const mnemonic = env.MNEMONIC;
    const contractAddr = env.CONTRACT_ADDRESS;

    const executor = await getFirstWalletPubkey(mnemonic);
    // try to collect leaf from backend
    const { submitted, report } = await checkSubmit(contractAddr, requestId, executor);
    const request = await getRequest(contractAddr, requestId);
    if (request.data && request.data.merkle_root) {
        if (submitted) await handleSignMerkleRoot(requestId, report, contractAddr);
        // not submitted means not in the merkle tree
        else return;
    }
    else {
        console.log("prepare to get new date for this request id");
        // get service contracts to get data from the scripts, then submit report
        let serviceContracts = await getServiceContracts(contractAddr, requestId);
        getData(contractAddr, requestId, serviceContracts).then(async ([result, reqId]) => {
            const { data, rewards } = result;
            const leaf = {
                executor,
                data,
                rewards
            }
            console.log("request id after getting new leaf data: ", reqId);
            console.log("leaf base64: ", Buffer.from(JSON.stringify(leaf)).toString('base64'));
            // use req id returned from the getData to preserve the id when getting data
            // check again if has submitted. This is because getting data takes a long time. During this period, another process may have finished already
            // try to collect leaf from backend
            const { submitted, report } = await checkSubmit(contractAddr, requestId, executor);
            if (!submitted) {
                await submitReport(reqId, leaf);
                await handleSignMerkleRoot(reqId, leaf, contractAddr);
            }
        });
    }
};

module.exports = processRequest;