import { queryWasmRaw } from './cosmjs';

type ResultTestCases = {
  testCases?: any[]
}

export const queryTestCases = async (addr: string) => {
  try {
    return await queryTestCasesRecursive(addr);
  } catch (error) {
    console.log("error querying test cases: ", error);
    return [];
  }
}

const queryTestCasesRecursive = async (
  addr: string,
  offset: string=null,
  results: ResultTestCases={}
) => {
  if (!results.testCases) {
    results.testCases = []
  }
  const limit = 1;
  const { data } = await queryWasmRaw(
    addr,
    JSON.stringify({
      get_test_cases: {
        limit: limit,
        offset
      }
    })
  );
  if (!data || !data.test_cases || data.test_cases.length === 0) {
    return results.testCases;
  }
  results.testCases = results.testCases.concat(data.test_cases);
  if (results.testCases.length >= data.total) {
    return results.testCases;
  }
  if (!data.test_cases.at(-1).parameters) {
    return results.testCases;
  }
  offset = Buffer.from(JSON.stringify(
    data.test_cases.at(-1).parameters
  )).toString('base64');
  return await queryTestCasesRecursive(addr, offset, results);
};
