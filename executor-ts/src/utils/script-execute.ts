import { spawn } from 'child_process';
import { queryWasm } from './cosmjs';
import { queryTestCases } from './query-testcase';
import { getServiceContracts } from './common';
import { AggregateResponse, AssertResponse, GetServiceContractsResponse, GetStateResponse, RequestStageResponse } from 'src/dtos';

export const getData = async (
  contractAddr: string,
  requestId: number,
  requestInput: any
) => {
  const serviceContracts = await getServiceContracts(contractAddr, requestId);
  console.log("request input is: ", requestInput);
  let [data, validDSources, validTestCases] = await handleScript(
    serviceContracts,
    requestInput
  );
  let { rewards } = await queryWasm(contractAddr, JSON.stringify({
    request: {
      stage: requestId
    }
  })) as RequestStageResponse;
  // first index of reward is executor / provider addr. We're filtering the list of eligible addrs
  let validDSourceRewards = rewards.filter(
    reward => validDSources.includes(reward[0])
  );
  let validTestCaseRewards = rewards.filter(
    reward => validTestCases.includes(reward[0])
  );
  let result = {
    data: Buffer.from(data).toString('base64'),
    // filter the rewards, only allow successful results from providers receive rewards
    rewards: validDSourceRewards.concat(validTestCaseRewards),
  }
  // return request id so that in the callback we can collect it
  return {
    result,
    requestId
  };
}

const executeTestCases = async (
  dsourceScriptUrl: string,
  tcaseAddrs: string[]
): Promise<AssertResponse[]> => {
  // run data source given the parameters of the test cases
  let assertResults = new Array<AssertResponse>();
  for (let tcaseAddr of tcaseAddrs) {
    // get the test case's input parameters
    let testCases = await queryTestCases(tcaseAddr);
    let assertInputs = [];
    for (let testCase of testCases) {
      // execute the data source given the test case input
      // handle deno script. By default, the user's input is the last element of the parameter list
      let result = await processDenoScript(
        dsourceScriptUrl,
        testCase.parameters
      );
      assertInputs.push(JSON.stringify({
        output: result.trim(),
        expected_output: testCase.expected_output
      }));
    }
    // assert the real results against the expected results
    let assertResult = await queryWasm(
      tcaseAddr,
      JSON.stringify({ assert: { assert_inputs: assertInputs } })
    ) as AssertResponse;
    assertResults.push(assertResult);
  }
  return assertResults;
}

export const handleScript = async (contracts: GetServiceContractsResponse, requestInput: any) => {
  const { oscript, dsources, tcases } = contracts;
  // execute the data sources
  let results = [];
  let validTestCases = [];
  let validDSources = [];
  for (let dsource of dsources) {
    let input = JSON.stringify({
      get_state: {}
    });
    let state = await queryWasm(dsource, input) as GetStateResponse;
    // if any test case status is true & data source status is false => the data source is invalid
    let assertResults = await executeTestCases(state.script_url, tcases)
    let assertResultsDSources = assertResults.filter(
      assertResult =>
        (!assertResult.dsource_status && assertResult.tcase_status)
    );
    if (assertResultsDSources.length > 0) {
      continue; // skip this data source
    }

    // collect all valid test cases
    let assertResultsTcases = assertResults.filter(
      assertResult =>
        assertResult.tcase_status
    ).map(assertResult => assertResult.contract);
    validTestCases = validTestCases.concat(assertResultsTcases);

    // By default, the user's input is the last element of the parameter list
    let result = await processDenoScript(
      state.script_url,
      [...state.parameters, requestInput]
    );
    results.push(result.trim()); // trim to remove trailing space & newline char
    validDSources.push(dsource);
  }

  // aggregate results
  let input = JSON.stringify({
    aggregate: {
      results
    }
  });
  let aggregateResponse = await queryWasm(oscript, input) as AggregateResponse;
  return [
    JSON.stringify(aggregateResponse),
    [... new Set(validDSources)],
    [... new Set(validTestCases)]
  ];
}

const processDenoScript = (scriptUrl: string, params: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const ls = spawn(
      'deno',
      [
        'run',
        '--allow-net',
        '--unstable',
        scriptUrl,
        JSON.stringify(params)
      ]
    );

    ls.stdout.on('data', (data) => {
      resolve(`${data}`);
    });
    ls.stderr.on('data', (data) => {
      const dataStr = data.toString();
      // Deno will push its log to err stream.
      // Most common logs include download & check module imports.
      // Otherwise, we reject err
      if (!dataStr.includes("Download") && !dataStr.includes("Check")) {
        console.log("data in error process deno: ", dataStr);
        reject(dataStr);
      }
    });
  })
}
