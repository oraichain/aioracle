const { queryWasmRaw } = require('./cosmjs');
const queryTestCases = async (addr) => {
    let testCases = [];
    let offset = null;

    try {
        let { data } = await queryWasmRaw(addr, JSON.stringify({ get_test_cases: { limit: 1 } }));
        if (!data) return [];
        else if (data.test_cases.length === data.total) return data.test_cases;
        else if (data.test_cases.length < data.total) {
            let finalTotal = data.total;
            let total = data.test_cases.length;
            testCases = testCases.concat(data.test_cases);
            do {
                let input = JSON.stringify({
                    get_test_cases: {
                        limit: 1,
                        offset,
                    }
                })
                let { data } = await queryWasmRaw(addr, input);
                if (data.test_cases.length > 0) {
                    testCases = testCases.concat(data.test_cases);
                    // key is the parameters in base64
                    offset = Buffer.from(JSON.stringify(data.test_cases[data.test_cases.length - 1].parameters)).toString('base64')
                    total += data.test_cases.length;
                }
            } while (total < finalTotal);
        }
        else return [];
    } catch (error) {
        console.log("error querying test cases: ", error);
        return [];
    }
    return testCases;
}

module.exports = queryTestCases;