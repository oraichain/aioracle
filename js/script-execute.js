const { spawn, execSync } = require('child_process');
const fetch = require('isomorphic-fetch');
const { queryWasm } = require('./cosmjs');
const queryTestCases = require('./query-testcase');
const { getServiceContracts } = require('./utils');

const getData = async (contractAddr, requestId, requestInput) => {
    const serviceContracts = await getServiceContracts(contractAddr, requestId);
    let [data, validDSources, validTestCases] = await handleScript(serviceContracts, requestInput);
    input = JSON.stringify({
        request: {
            stage: requestId
        }
    });
    let { rewards } = await queryWasm(contractAddr, input);
    let validDSourceRewards = rewards.filter(reward => validDSources.includes(reward[0]));
    let validTestCaseRewards = rewards.filter(reward => validTestCases.includes(reward[0]));
    let result = {
        data: Buffer.from(data).toString('base64'),
        // filter the rewards, only allow successful results from providers receive rewards
        rewards: validDSourceRewards.concat(validTestCaseRewards),
    }
    return [result, requestId]; // return request id so that in the callback we can collect it
}

const executeTestCases = async (dsourceScriptUrl, tcaseAddrs) => {
    // run data source given the parameters of the test cases
    let assertResults = [];
    for (let tcaseAddr of tcaseAddrs) {
        // get the test case's input parameters
        let testCases = await queryTestCases(tcaseAddr);
        let assertInputs = [];
        for (let testCase of testCases) {
            // execute the data source given the test case input
            // handle deno script. By default, the user's input is the last element of the parameter list
            let result = await processDenoScript(dsourceScriptUrl, [JSON.parse(testCase.parameters)]);
            let assertInput = { output: result.trim(), expected_output: testCase.expected_output };
            assertInputs.push(JSON.stringify(assertInput));
        }
        // assert the real results against the expected results
        let assertResult = await queryWasm(tcaseAddr, JSON.stringify({ assert: { assert_inputs: assertInputs } }));
        assertResults.push(assertResult);
    }
    return assertResults;
}

// TODO: make sure that this function calls enough data sources & test cases. This one is just a demo to run deno only.
const handleScript = async (contracts, requestInput) => {
    const { oscript, dsources, tcases } = contracts;
    // execute the data sources
    let results = [];
    let validTestCases = [];
    let validDSources = [];
    for (let dsource of dsources) {
        let input = JSON.stringify({
            get_state: {}
        });
        let state = await queryWasm(dsource, input);
        // if any test case status is true & data source status is false => the data source is invalid
        let assertResults = await executeTestCases(state.script_url, tcases)
        let assertResultsDSources = assertResults.filter(assertResult => (!assertResult.dsource_status && assertResult.tcase_status));
        if (assertResultsDSources.length > 0) continue; // skip this data source

        // collect all valid test cases
        let assertResultsTcases = assertResults.filter(assertResult => assertResult.tcase_status).map(assertResult => assertResult.contract);
        validTestCases = validTestCases.concat(assertResultsTcases);

        // handle deno script. By default, the user's input is the last element of the parameter list
        let result = await processDenoScript(state.script_url, [...state.parameters, requestInput]);
        results.push(result.trim()); // trim to remove trailing space & newline char

        // append valid data sources
        validDSources.push(dsource);
    }
    // aggregate results
    let input = JSON.stringify({
        aggregate: {
            results
        }
    });
    let { data } = await fetch(`https://testnet-lcd.orai.io/wasm/v1beta1/contract/${oscript}/smart/${Buffer.from(input).toString('base64')}`).then(data => data.json())
    return [JSON.stringify(data), [... new Set(validDSources)], [... new Set(validTestCases)]];
}

const processDenoScript = (scriptUrl, params) => {
    return new Promise((resolve, reject) => {
        const denoPath = execSync("which deno").toString('ascii').trim(); // collect absolute path for deno binary. This helps when the binary runs as a ubuntu service
        const ls = spawn(denoPath, ['run', '--allow-net', '--unstable', scriptUrl, ...params]);

        ls.stdout.on('data', (data) => {
            resolve(`${data}`);
        });
        ls.stderr.on('data', (data) => {
            const dataStr = data.toString();
            console.log("data in error process deno: ", dataStr);
            // Deno will push its log to err stream. Most common logs include download & check module imports. Otherwise, we reject err
            if (!dataStr.includes("Download") && !dataStr.includes("Check")) reject(dataStr);
        });
    })
}

module.exports = { handleScript, getData };
