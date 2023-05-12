import { spawn } from 'child_process';
import { AioracleContractClient, Service, TestCaseState } from '@oraichain/aioracle-contracts-sdk/src';

type AssertResponse = {
  dsource: string;
  dSourceResult: string;
}

type HandleScriptResponse = {
  aggregateResponse: string;
  assertResults: AssertResponse[];
  dsourceResults: string[];
}

function convertToDenoScriptInput(params: string[]): string {
  return Buffer.from(JSON.stringify(params)).toString('base64');
}

export const executeService = async (
  requestId: number,
  serviceName: string,
  requestInput: string,
  aioracleClient: AioracleContractClient
) => {
  const serviceInfo = await aioracleClient.getService({ serviceName });
  console.log("request input is: ", requestInput);
  let { aggregateResponse, assertResults } = await handleScript(
    serviceInfo.service,
    requestInput
  );
  let result = {
    data: Buffer.from(aggregateResponse).toString('base64'),
    assertResults
  }
  // return request id so that in the callback we can collect it
  return {
    result,
    requestId
  };
}

const executeTestCases = async (
  dsourceScriptUrl: string,
  testCaseStates: TestCaseState[]
): Promise<AssertResponse[]> => {
  // run data source given the parameters of the test cases
  let assertResults = new Array<AssertResponse>();
  for (let testCase of testCaseStates) {
    // execute the data source given the test case input
    // handle deno script. By default, the user's input is the last element of the parameter list
    let result = await processDenoScript(
      dsourceScriptUrl,
      convertToDenoScriptInput(testCase.inputs)
    );
    assertResults.push({ dsource: dsourceScriptUrl, dSourceResult: result });
  }
  return assertResults;
}

export const handleScript = async (service: Service, requestInput: string): Promise<HandleScriptResponse> => {
  const { oscript_url, dsources, tcases } = service;
  // execute the data sources
  const dsourceResults: string[] = [];
  let assertResults: AssertResponse[];
  // let validDSources = [];
  for (let dsource of dsources) {
    // if any test case status is true & data source status is false => the data source is invalid
    let assertResults = await executeTestCases(dsource.script_url, tcases)
    // TODO: add test case result filtering here

    // By default, the user's input is the last element of the parameter list
    let result = await processDenoScript(
      dsource.script_url,
      convertToDenoScriptInput([...dsource.parameters, requestInput])
    );
    dsourceResults.push(result.trim()); // trim to remove trailing space & newline char
    // validDSources.push(dsource);
  }

  // aggregate results
  let aggregateResponse = await processDenoScript(oscript_url, convertToDenoScriptInput(dsourceResults));
  return {
    aggregateResponse: aggregateResponse.trim(),
    assertResults,
    dsourceResults,
  };
}

const processDenoScript = (scriptUrl: string, params: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const ls = spawn(
      'deno',
      [
        'run',
        '--allow-net',
        '--unstable',
        scriptUrl,
        params
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
