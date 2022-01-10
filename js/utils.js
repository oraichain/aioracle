const fetch = require('isomorphic-fetch');
const fs = require('fs');
const getRequest = async (contractAddr, requestId) => {
    const input = JSON.stringify({
        request: {
            stage: requestId
        }
    })

    return fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
}

const getStageInfo = async (contractAddr) => {
    const input = JSON.stringify({
        stage_info: {}
    })

    const data = await fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
    if (!data.data) {
        throw "No request to handle";
    }
    return data.data;
}

const checkSubmit = async (contractAddr, requestId, executor) => {
    return fetch(`http://localhost:3000/check_submit?contract_addr=${contractAddr}&request_id=${requestId}&executor=${Buffer.from(executor, 'base64').toString('hex')}`).then(data => data.json());
}

const getServiceContracts = async (contractAddr, requestId) => {
    const input = JSON.stringify({
        get_service_contracts: { stage: parseInt(requestId) }
    })

    const data = await fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${contractAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json());
    if (!data.data) {
        throw "No service contracts to execute";
    }
    return data.data;
}

const submitReport = async (requestId, leaf) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': "application/json"
        },
        body: JSON.stringify({ requestId, report: leaf }),
        redirect: 'follow'
    };
    const result = await fetch("http://localhost:3000/submit_report", requestOptions).then(data => data.json());
    console.log("result: ", result);
}

const initStage = async (path, contractAddr) => {
    let requestId = 1;
    let latestStage = 1;
    // let checkpointThreshold = 5;
    if (!fs.existsSync(path)) {
        let data = await getStageInfo(contractAddr);
        console.log("data: ", data);
        requestId = data.checkpoint;
        latestStage = data.latest_stage;
        // checkpointThreshold = data.checkpoint_threshold;
        // write file to dir
        fs.writeFile(path, JSON.stringify(data), 'utf8', (err, data) => {
            if (err) {
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
        // checkpointThreshold = data.checkpoint_threshold;
    }
    return { requestId, latestStage };
}

module.exports = { getRequest, getStageInfo, submitReport, getServiceContracts, checkSubmit, initStage };