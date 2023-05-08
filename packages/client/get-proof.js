const crypto = require('crypto');
const sha256 = (data) => crypto.createHash('sha256').update(data).digest();
const fetch = require('isomorphic-fetch');
require('dotenv').config();

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';
// const contractAddr = process.env.CONTRACT_ADDRESS;
// const requestId = 284;

// const getReports = async (requestId) => {
//     const { data } = await fetch(`${backendUrl}/report/reports?request_id=${requestId}&contract_addr=${contractAddr}`).then(data => data.json());
//     return data;
// }

const getFinishedReports = async (executor, contractAddr) => {
    const { data } = await fetch(`${backendUrl}/executor/finished/${Buffer.from(executor, 'base64').toString('hex')}?contract_addr=${contractAddr}`).then(data => data.json());
    return data;
}

// example of a valid raw leaf: 
/*
{
  executor: 'AipQCudhlHpWnHjSgVKZ+SoSicvjH7Mp5gCFyDdlnQtn',
  data: 'W3sibGFiZWwiOiJzdW5mbG93ZXIiLCJzY29yZSI6OTl9XQ==',
  rewards: [],
  signature: 'KKkZPjY0CGFcSkk1W9Z1OCqjwi73YsIdu7eIKkElc9J79h+61MUcVZFcqVsFJu2IIPafnYi7ir4RRTPFpisZog=='
}
*/

// to verify, we need to use sha256 on the leaf data. Eg:

/*
{
  executor: 'AipQCudhlHpWnHjSgVKZ+SoSicvjH7Mp5gCFyDdlnQtn',
  data: '41486ea1f6ca67f23c297746f0193426085a140929dd66d5fc2094c8186e1b8a',
  rewards: [],
  signature: 'KKkZPjY0CGFcSkk1W9Z1OCqjwi73YsIdu7eIKkElc9J79h+61MUcVZFcqVsFJu2IIPafnYi7ir4RRTPFpisZog=='
}

// then we submit the object to the backend
*/

const handleFinishedReports = async (executor, contractAddr) => {
    const reports = await getFinishedReports(executor, contractAddr);
    let listProofs = [];
    for (let { report: leaf, requestId } of reports) {
        let proofs = {};
        let finalReport = { ...leaf, data: sha256(leaf.data).toString('hex') };
        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': "application/json"
            },
            body: JSON.stringify({ request_id: requestId, contract_addr: contractAddr, leaf: finalReport }),
            redirect: 'follow'
        };
        proofs = await fetch(`${backendUrl}/proof`, requestOptions).then(data => data.json());
        listProofs.push({ proofs, finalReport, requestId });
    }
    return listProofs;
}

const updateClaim = async (data, contractAddr) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': "application/json"
        },
        body: JSON.stringify({ data, contract_addr: contractAddr }),
        redirect: 'follow'
    };
    let result = await fetch(`${backendUrl}/executor/claim`, requestOptions).then(data => data.json())
    return result;
}

// const start = async () => {
//     const reports = await handleFinishedReports(process.env.EXECUTOR, process.env.CONTRACT_ADDRESS);
//     console.log("reports: ", reports)
// }

// start();

module.exports = { handleFinishedReports, updateClaim };