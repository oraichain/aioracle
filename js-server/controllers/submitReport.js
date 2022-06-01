
const { getRequest, handleResponse, isWhiteListed, verifySignature } = require('../utils');
const { env } = require('../config');
const { MongoDb } = require('../models/mongo');

const submitReport = async (req, res) => {
    let { request_id: requestId, report } = req.body;
    // const requestId = request_id;
    // const contractAddr = contract_addr;
    const contractAddr = env.CONTRACT_ADDRESS;
    const mongoDb = new MongoDb(contractAddr);

    requestId = parseInt(requestId);

    try {
        const requestData = await getRequest(contractAddr, requestId);
        console.log(requestData,"=========================")
        const threshold = requestData.data.threshold;
        // verify executor not in list
        if (!(await isWhiteListed(contractAddr, report.executor))) return handleResponse(res, 401, "not in list");

        const { signature, ...rawReport } = report;
        // verify report signature
        let rawMessage = {
            requestId,
            report: rawReport
        }
        if (!verifySignature(Buffer.from(JSON.stringify(rawMessage), 'ascii'), Buffer.from(signature, 'base64'), Buffer.from(report.executor, 'base64'))) return handleResponse(res, 403, "Invalid report signature");
        let executorReport = await mongoDb.findReport(requestId, report.executor);
        // if we cant find the request id, we init new
        if (executorReport) return handleResponse(res, 403, "You already submitted the report");
        const reportCount = await mongoDb.countExecutorReports(requestId);
        if (reportCount < threshold) {
            mongoDb.insertRequest(requestId, threshold);
            // insert executor with report for easy indexing & querying
            mongoDb.insertExecutorReport(requestId, report.executor, report);
            return handleResponse(res, 200, "success");
        }
        else return handleResponse(res, 403, "request has already finished");
    } catch (error) {
        return handleResponse(res, 500, String(error));
    }
}

module.exports = { submitReport };