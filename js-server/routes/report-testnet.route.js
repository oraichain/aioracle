const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate, isValidRewards } = require('./validate');
const { getRequest, handleResponse, isWhiteListed, verifySignature } = require('../utils');
const { env } = require('../config');
const { MongoDb } = require('../models/mongo');
const client = require('../mongo');

const submitReport = async (req, res) => {
    let { request_id: requestId, report } = req.body;
    // const requestId = request_id;
    const contractAddr = env.CONTRACT_ADDR_BENCHMARKING;
    const mongoDb = new MongoDb(contractAddr);

    requestId = parseInt(requestId);

    try {
        const requestData = await getRequest(contractAddr, 1);
        const threshold = requestData.data.threshold;
        // verify executor not in list
        if (!(await isWhiteListed(contractAddr, report.executor))) return handleResponse(res, 401, "not in list");

        const { signature, ...rawReport } = report;
        // verify report signature
        let rawMessage = {
            requestId: 10,
            report: { "executor": "AipQCudhlHpWnHjSgVKZ+SoSicvjH7Mp5gCFyDdlnQtn", "data": "W3sibGFiZWwiOiJzdW5mbG93ZXIiLCJzY29yZSI6OTh9XQ==", "rewards": [] }
        }
        if (!verifySignature(Buffer.from(JSON.stringify(rawMessage), 'ascii'), Buffer.from("WmOqn9Dy23YMAS/36G4xM6ezetUSgIg/ewZgMak6/LgmJKJXJ2TnhPYpEVTCPO1vu4lcPNsAbtYhsXG9dFhfcA==", 'base64'), Buffer.from(report.executor, 'base64'))) return handleResponse(res, 403, "Invalid report signature");
        let executorReport = await mongoDb.findReport(requestId, report.executor);
        // if we cant find the request id, we init new
        const reportCount = await mongoDb.countExecutorReports(requestId);
        requestId = Math.floor(Math.random() * 1000000000000000);
        mongoDb.insertRequest(requestId, threshold);
        // insert executor with report for easy indexing & querying
        mongoDb.insertExecutorReport(requestId, report.executor, report);
        return handleResponse(res, 200, "success");
    } catch (error) {
        return handleResponse(res, 500, String(error));
    }
}

const basicInsert = async (req, res) => {
    // const requestData = await getRequest(env.CONTRACT_ADDR_BENCHMARKING, 1);
    // isWhiteListed(env.CONTRACT_ADDR_BENCHMARKING, "AipQCudhlHpWnHjSgVKZ+SoSicvjH7Mp5gCFyDdlnQtn");

    // const contractAddr = env.CONTRACT_ADDR_BENCHMARKING;
    // const mongoDb = new MongoDb(contractAddr);

    // // verify report signature
    // let rawMessage = {
    //     requestId: 10,
    //     report: { "executor": "AipQCudhlHpWnHjSgVKZ+SoSicvjH7Mp5gCFyDdlnQtn", "data": "W3sibGFiZWwiOiJzdW5mbG93ZXIiLCJzY29yZSI6OTh9XQ==", "rewards": [] }
    // }
    // if (!verifySignature(Buffer.from(JSON.stringify(rawMessage), 'ascii'), Buffer.from("WmOqn9Dy23YMAS/36G4xM6ezetUSgIg/ewZgMak6/LgmJKJXJ2TnhPYpEVTCPO1vu4lcPNsAbtYhsXG9dFhfcA==", 'base64'), Buffer.from("AipQCudhlHpWnHjSgVKZ+SoSicvjH7Mp5gCFyDdlnQtn", 'base64'))) return handleResponse(res, 403, "Invalid report signature");
    // const requestId = 8;
    // let executorReport = await mongoDb.findReport(requestId, "AipQCudhlHpWnHjSgVKZ+SoSicvjH7Mp5gCFyDdlnQtn");
    // // if we cant find the request id, we init new
    // const reportCount = await mongoDb.countExecutorReports(requestId);

    const db = client.db("test-collection");
    await db.collection("foobar").insertOne({ "foobar": "helloworld" });
    return handleResponse(res, 200, "success");
}

router.post('/', validate([body('request_id').notEmpty().isNumeric(), body('report').notEmpty().isObject(), body('report.executor').notEmpty().isBase64().isLength({ min: 44, max: 44 }), body('report.data').notEmpty().isBase64(), body('report.signature').notEmpty().isBase64().isLength({ min: 88, max: 88 }), body('report.rewards').isArray().custom(rewards => isValidRewards(rewards))]), submitReport);

router.get('/', basicInsert);

module.exports = router;