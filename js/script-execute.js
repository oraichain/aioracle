const { spawn } = require('child_process');
const fetch = require('isomorphic-fetch');

// TODO: make sure that this function calls enough data sources & test cases. This one is just a demo to run deno only.
const handleScript = async (contracts) => {
    const { oscript, dsources, tcases } = contracts;
    // execute the data sources
    let results = [];
    for (let dsource of dsources) {
        let input = JSON.stringify({
            get_state: {}
        });
        let data = await fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${dsource}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json())

        // handle deno script
        let result = await processDenoScript(data.data.script_url, data.data.parameters);
        results.push(result.trim()); // trim to remove trailing space & newline char
    }
    // aggregate results
    let input = JSON.stringify({
        aggregate: {
            results
        }
    });
    let { data } = await fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${oscript}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json())
    return JSON.stringify(data);
}

const processDenoScript = (scriptUrl, params) => {
    return new Promise((resolve, reject) => {
        const ls = spawn('deno', ['run', '--allow-net', '--unstable', scriptUrl, ...params]);

        ls.stdout.on('data', (data) => {
            resolve(`${data}`);
        });
        ls.stderr.on('data', (data) => {
            const dataStr = data.toString();
            console.log("data in error process deno: ", dataStr);
            // Deno will push its log to err stream. Most common logs include download & check module imports. Otherwise, we reject err
            if (!dataStr.includes("Download") && !dataStr.includes("Check")) reject(`${data}`);
        });
    })
}

module.exports = { handleScript };
