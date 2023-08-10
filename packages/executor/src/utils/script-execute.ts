import {
  AioracleContractClient,
  Service,
  TestCaseState,
} from "@oraichain/aioracle-contracts-sdk/src";
import { spawnPromise } from "./common";

type AssertResponse = {
  dsource: string;
  testCaseResult: string;
};

type HandleScriptResponse = {
  aggregateResponse: string;
  assertResults: AssertResponse[][];
  dsourceResults: string[];
};

type DenoScriptResponse = {
  code: number;
  data: string;
  error: string;
};

function convertToDenoScriptInput(params: string[]): string {
  return Buffer.from(JSON.stringify(params)).toString("base64");
}

export async function executeService(
  requestId: number,
  serviceName: string,
  requestInput: string,
  aioracleClient: AioracleContractClient
) {
  const serviceInfo = await aioracleClient.getService({ serviceName });
  console.log("request input is: ", requestInput);
  let { aggregateResponse, assertResults, dsourceResults } = await handleScript(
    serviceInfo.service,
    requestInput
  );
  let serviceResult: string = Buffer.from(
    JSON.stringify({ aggregateResponse, assertResults, dsourceResults })
  ).toString("base64");
  // return request id so that in the callback we can collect it
  return {
    serviceResult,
    requestId,
  };
}

export async function handleScript(
  service: Service,
  requestInput: string
): Promise<HandleScriptResponse> {
  const { oscript_url, dsources, tcases } = service;
  // execute the data sources
  const dsourceResults: string[] = [];
  let assertResults: AssertResponse[][] = [[]];
  // let validDSources = [];
  for (let dsource of dsources) {
    // if any test case status is true & data source status is false => the data source is invalid
    let testCaseResults = await executeTestCases(dsource.script_url, tcases);
    assertResults.push(testCaseResults);

    // By default, the user's input is the last element of the parameter list
    let result = await processDenoScript(
      dsource.script_url,
      convertToDenoScriptInput([...dsource.parameters, requestInput])
    );
    console.log("dsource result: ", result);
    dsourceResults.push(result.trim()); // trim to remove trailing space & newline char
    // validDSources.push(dsource);
  }

  // aggregate results
  let aggregateResponse = await processDenoScript(
    oscript_url,
    convertToDenoScriptInput(dsourceResults)
  );
  return {
    aggregateResponse: aggregateResponse.trim(),
    assertResults,
    dsourceResults,
  };
}

async function executeTestCases(
  dsourceScriptUrl: string,
  testCaseStates: TestCaseState[]
): Promise<AssertResponse[]> {
  // run data source given the parameters of the test cases
  let assertResults = new Array<AssertResponse>();
  for (let testCase of testCaseStates) {
    // execute the data source given the test case input
    // handle deno script. By default, the user's input is the last element of the parameter list
    let result = await processDenoScript(
      dsourceScriptUrl,
      convertToDenoScriptInput(testCase.inputs)
    );
    assertResults.push({ dsource: dsourceScriptUrl, testCaseResult: result });
  }
  return assertResults;
}

async function processDenoScript(
  scriptUrl: string,
  params: string
): Promise<string> {
  const result = (await spawnPromise("deno", [
    "run",
    "--allow-net",
    "--unstable",
    scriptUrl,
    params,
  ])) as DenoScriptResponse;
  if (result.error.length > 0 || result.code !== 0) return result.error;
  return result.data;
}
