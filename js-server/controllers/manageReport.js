const db = require('../db');
const { handleResponse } = require('../utils');
const { MongoDb } = require('../models/mongo');

const checkSubmit = async (req, res) => {
    let data = req.query;
    const mongoDb = new MongoDb(data.contract_addr);

    try {
        const reports = await mongoDb.findReports(parseInt(data.request_id));
        if (!reports) return res.status(404).send({ submitted: false, code: 404 });
        const report = reports.filter(rep => rep.executor === Buffer.from(data.executor, 'hex').toString('base64')); // convert executor pubkey to hex to put in query string parameter. decode to base64
        if (report.length > 0) return res.send({ code: 200, submitted: true, report: report[0] })
        else return res.status(404).send({ submitted: false, code: 404 });
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
    let data = req.query;
    const mongoDb = new MongoDb(data.contract_addr);
    try {
        let reports = await mongoDb.findReports(parseInt(data.request_id));
        if (reports) return handleResponse(res, 200, "successfully retrieved the reports", reports);
        return handleResponse(res, 404, "cannot find the reports with the given request id and contract address");
    } catch (error) {
        return handleResponse(res, 500, error);
    }
}

module.exports = { checkSubmit, getReports, getReport };