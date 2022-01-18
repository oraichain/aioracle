const db = require('../db');
const { handleResponse } = require('../utils');

const checkSubmit = async (req, res) => {
    let data = req.query;
    if (!data.request_id || !data.executor || !data.contract_addr) return res.status(403).send({ code: 403 });
    let key = `${data.contract_addr}${data.request_id}`;
    let reportsStr = "";
    try {
        reportsStr = await db.get(key);
    } catch (error) {
        // cannot find key case
        return res.status(404).send({ submitted: false, code: 404 });
    }
    try {
        const reports = JSON.parse(reportsStr);
        const report = reports.filter(rep => rep.executor === Buffer.from(data.executor, 'hex').toString('base64')); // convert executor pubkey to hex to put in query string parameter. decode to base64
        if (report.length > 0) return res.send({ code: 200, submitted: true, report: report[0] })
        else return res.status(404).send({ submitted: false, code: 404 });
    } catch (error) {
        console.log("error in checking submit: ", error);
        return res.status(404).send({ code: 404, message: "Error getting report submission", error })
    }
}

const getReports = async (req, res) => {
    let data = req.query;
    if (!data.request_id || !data.contract_addr) return res.status(403).send({ code: 403 });
    let key = `${data.contract_addr}${data.request_id}`;
    let reportsStr = "";
    try {
        reportsStr = await db.get(key);
    } catch (error) {
        // cannot find key case
        return handleResponse(res, 404, "cannot find the reports with the given request id and contract address");
    }
    if (reportsStr === "") {
        return handleResponse(res, 404, "cannot find the reports with the given request id and contract address");
    }
    const [err, result] = safeJsonParse(reportsStr);
    if (err) {
        console.log('Failed to parse JSON: ' + err.message);
        return handleResponse(res, 200, "successfully retrieved the reports", reportsStr);
    }
    return handleResponse(res, 200, "successfully retrieved the reports", result);
}

const safeJsonParse = (str) => {
    try {
        return [null, JSON.parse(str)];
    } catch (err) {
        return [err];
    }
}

module.exports = { checkSubmit, getReports };