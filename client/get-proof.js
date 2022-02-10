const crypto = require('crypto');
const sha256 = (data) => crypto.createHash('sha256').update(data).digest();
const fetch = require('isomorphic-fetch');

const backendUrl = 'http://localhost:8080';
const contractAddr = 'orai1d2yhksryjk6ly0wa6nwkp9t563s5ap2kzar7up';
const requestId = 169;

const getReports = async (requestId) => {
    const { data } = await fetch(`${backendUrl}/report-info/get-reports?request_id=${requestId}&contract_addr=${contractAddr}`).then(data => data.json());
    return data[0];
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

const getProofs = async (requestId, leaf) => {
    let result = {};
    let finalLeaf = { ...leaf, data: sha256(leaf.data).toString('hex') };
    console.log("final leaf: ", finalLeaf);
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': "application/json"
        },
        body: JSON.stringify({ request_id: requestId, contract_addr: contractAddr, leaf: finalLeaf }),
        redirect: 'follow'
    };
    result = await fetch(`${backendUrl}/report-info/get-proof`, requestOptions).then(data => data.json());
    return result;
}

const start = async () => {
    const leaf = await getReports(requestId, contractAddr);
    const proofs = await getProofs(requestId, leaf);
    console.log("proofs: ", proofs)
}

start();