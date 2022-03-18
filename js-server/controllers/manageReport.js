const { handleResponse } = require('../utils');
const { MongoDb } = require('../models/mongo');

const checkSubmit = async (req, res) => {
    let data = req.query;
    const mongoDb = new MongoDb(data.contract_addr);

    try {
        const report = await mongoDb.findReport(parseInt(data.request_id), Buffer.from(data.executor, 'hex').toString('base64'));
        if (!report) return res.status(404).send({ submitted: false, code: 404 });
        else return res.send({ code: 200, submitted: true, report: report[0] })
    } catch (error) {
        console.log("error in checking submit: ", error);
        return res.status(404).send({ code: 404, message: "Error getting report submission", error })
    }
}

const getReport = async (req, res) => {
    const { request_id: requestId, contract_addr: contractAddr } = req.query;
    const { executor } = req.params;
    const mongoDb = new MongoDb(contractAddr);
    try {
        let report = await mongoDb.findReport(parseInt(requestId), executor);
        if (report) return handleResponse(res, 200, "successfully retrieved the report", report);
        return handleResponse(res, 404, "cannot find the report with the given request id, contract address & executor");
    } catch (error) {
        return handleResponse(res, 500, error);
    }
}

const getReports = async (req, res) => {
    let { contract_addr, request_id, page_number, limit_per_page } = req.query;

    const mongoDb = new MongoDb(contract_addr);
    try {
        limit_per_page = parseInt(limit_per_page);
        page_number = parseInt(page_number);
        const limit = limit_per_page > 0 ? limit_per_page : 5;
        const skip = page_number > 0 ? ((page_number - 1) * limit) : 0;
        // collect the root hex based on the request id to form a tree
        let reports = await mongoDb.findReports(parseInt(request_id), skip, limit);
        if (reports) return handleResponse(res, 200, "successfully retrieved the reports", reports);
        return handleResponse(res, 404, "cannot find the reports with the given request id and contract address");
    } catch (error) {
        return handleResponse(res, 500, error);
    }
}

module.exports = { checkSubmit, getReport, getReports };