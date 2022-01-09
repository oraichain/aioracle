const { spawn } = require('child_process');
const fetch = require('isomorphic-fetch');

// TODO: make sure that this function calls enough data sources & test cases. This one is just a demo to run deno only.
const handleScript = async (scriptAddr) => {
    let input = JSON.stringify({
        get_state: {}
    });
    let data = await fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${scriptAddr}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json())

    // handle deno script
    let result = await processDenoScript(data.data.script_url, data.data.parameters);
    return result;
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
