const crypto = require('crypto');
const sha256 = (data) => crypto.createHash('sha256').update(data).digest();
const fetch = require('isomorphic-fetch');

const backendUrl = 'http://localhost:8080';
const contractAddr = 'orai1d2yhksryjk6ly0wa6nwkp9t563s5ap2kzar7up';
const requestId = 284;

const getReports = async (requestId) => {
    const { data } = await fetch(`${backendUrl}/report-info/get-reports?request_id=${requestId}&contract_addr=${contractAddr}`).then(data => data.json());
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

const getProofs = async (requestId, contractAddr) => {
    const leafs = await getReports(requestId, contractAddr);
    let listProofs = [];
    for (let leaf of leafs) {
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
        proofs = await fetch(`${backendUrl}/report-info/get-proof`, requestOptions).then(data => data.json());
        listProofs.push({ proofs, finalReport });
    }
    return listProofs;
}

const start = async () => {
    const listProofs = await getProofs(requestId, contractAddr);
    console.log("proofs: ", proofs)
}

module.exports = getProofs;