const fetch = require('isomorphic-fetch');
const fs = require('fs');
const _ = require('lodash');
const { env, network } = require('./config');
const Cosmos = require('@oraichain/cosmosjs').default;
const { signSignature } = require('./crypto');
const { queryWasmRaw, handleFetchResponse } = require('./cosmjs');

const backendUrl = env.BACKEND_URL;

const parseError = (error) => {
    if (typeof error === 'string' || error instanceof String) {
        return error;
    } else if (typeof error === 'object' && !Array.isArray(error) && error !== null) {
        const errorStringtify = JSON.stringify(error);
        if (_.isEmpty(JSON.parse(errorStringtify))) return error; // has to parse again into object to check if it's empty after stringtify. if yes then we return error directly instead of stringtify
        return JSON.stringify(error);
    } else if (error.constructor === Error) {
        return error;
    } else {
        return String(error)
    }
}

const writeErrorMessage = (error) => {
    return `Date: ${new Date().toUTCString()}\nError: ${parseError(error)}\n\n`;
}

const getRequest = async (contractAddr, requestId) => {
    const input = JSON.stringify({
        request: {
            stage: requestId
        }
    })
    return queryWasmRaw(contractAddr, input);
}

const getStageInfo = async (contractAddr) => {
    const input = JSON.stringify({
        stage_info: {}
    })

    const data = await queryWasmRaw(contractAddr, input);
    if (!data.data) {
        throw "No request to handle";
    }
    return data.data;
}

const checkSubmit = async (contractAddr, requestId, executor) => {
    return fetch(`${backendUrl}/report/submitted?contract_addr=${contractAddr}&request_id=${requestId}&executor=${Buffer.from(executor, 'base64').toString('hex')}`).then(data => handleFetchResponse(data));
}

const getServiceContracts = async (contractAddr, requestId) => {
    const input = JSON.stringify({
        get_service_contracts: { stage: parseInt(requestId) }
    })

    const data = await queryWasmRaw(contractAddr, input);
    if (!data.data) {
        throw "No service contracts to execute";
    }
    return data.data;
}

const submitReport = async (requestId, leaf, mnemonic) => {

    // sign report for future verification
    const childKey = Cosmos.getChildKeyStatic(mnemonic, network.path, true);
    const pubKey = childKey.publicKey;
    let message = { requestId, report: leaf };
    const signature = Buffer.from(signSignature(Buffer.from(JSON.stringify(message), 'ascii'), childKey.privateKey, pubKey)).toString('base64');
    message = { request_id: requestId, report: { ...leaf, signature } };

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': "application/json"
        },
        body: JSON.stringify(message),
        redirect: 'follow'
    };
    const result = await fetch(`${backendUrl}/report`, requestOptions).then(data => handleFetchResponse(data));
    console.log("result submitting report: ", result);
    console.log("Successful submission time: ", new Date().toUTCString())
}

module.exports = { getRequest, getStageInfo, submitReport, getServiceContracts, checkSubmit, handleFetchResponse, parseError, writeErrorMessage };