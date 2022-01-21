const fetch = require('isomorphic-fetch');
const fs = require('fs');
const { env, network } = require('./config');
const Cosmos = require('@oraichain/cosmosjs').default;
const signSignature = require('./crypto');

const lcdUrl = env.LCD_URL;
const backendUrl = env.BACKEND_URL;

const getRequest = async (contractAddr, requestId) => {
    const input = JSON.stringify({
        request: {
            stage: requestId
        }
    })
    return fetch(`${lcdUrl}/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
}

const getStageInfo = async (contractAddr) => {
    const input = JSON.stringify({
        stage_info: {}
    })

    const data = await fetch(`${lcdUrl}/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
    if (!data.data) {
        throw "No request to handle";
    }
    return data.data;
}

const checkSubmit = async (contractAddr, requestId, executor) => {
    return fetch(`${backendUrl}/report-info/check-submit?contract_addr=${contractAddr}&request_id=${requestId}&executor=${Buffer.from(executor, 'base64').toString('hex')}`).then(data => data.json());
}

const getServiceContracts = async (contractAddr, requestId) => {
    const input = JSON.stringify({
        get_service_contracts: { stage: parseInt(requestId) }
    })

    const data = await fetch(`${lcdUrl}/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
    if (!data.data) {
        throw "No service contracts to execute";
    }
    return data.data;
}

const submitReport = async (requestId, leaf, mnemonic) => {

    // sign report for future verification
    const childKey = Cosmos.getChildKeyStatic(mnemonic, true, network.path);
    const pubKey = childKey.publicKey;
    let message = { requestId, report: leaf };
    const signature = signSignature(JSON.stringify(message), childKey.privateKey, pubKey);
    message = { requestId, report: { ...leaf, signature } };

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': "application/json"
        },
        body: JSON.stringify(message),
        redirect: 'follow'
    };
    const result = await fetch(`${backendUrl}/submit-report`, requestOptions).then(data => data.json());
    console.log("result submitting report: ", result);
}

const initStage = async (path, contractAddr) => {
    let requestId = 1;
    let latestStage = 1;
    let checkpointThreshold = 5;
    try {
        if (!fs.existsSync(path)) {
            let data = await getStageInfo(contractAddr);
            requestId = data.checkpoint;
            latestStage = data.latest_stage;
            checkpointThreshold = data.checkpoint_threshold;
            // write file to dir
            fs.writeFile(path, JSON.stringify(data), 'utf8', (error, data) => {
                if (error) {
                    console.log("error writing file: ", error);
                    return;
                }
                console.log("finish writing file")
            });
        } else {
            // read from file
            const buffer = fs.readFileSync(path, 'utf-8');
            const data = JSON.parse(buffer);
            requestId = data.checkpoint;
            latestStage = data.latest_stage;
            checkpointThreshold = data.checkpoint_threshold;
        }
    } catch (error) {
        return { requestId, latestStage, checkpointThreshold };
    }
    return { requestId, latestStage, checkpointThreshold };
}

module.exports = { getRequest, getStageInfo, submitReport, getServiceContracts, checkSubmit, initStage };