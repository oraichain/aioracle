const client = require('../../mongo');
const { constants } = require('../../config');
const findReports = require('./findReports');

const updateReports = async (collection, requestId, reports) => {
    const filter = { requestId };
    // create a document that sets the plot of the movie
    const updateDoc = {
        $set: {
            reports
        },
    };

    const result = await collection.updateOne(filter, updateDoc);
    console.log("update reports result: ", result);
}

const updateReportsStatus = async (contractAddr, requestId) => {

    await client.connect();

    const db = client.db(contractAddr);
    const collection = db.collection(constants.REQUESTS_COLLECTION);

    const filter = { requestId };
    // create a document that sets the plot of the movie
    const updateDoc = {
        $set: {
            submitted: true
        },
    };

    const result = await collection.updateOne(filter, updateDoc);
    console.log("update reports result: ", result);
}

const insertReports = async (collection, requestId, reports, threshold) => {
    const insertObj = {
        requestId,
        reports,
        threshold
    }
    const result = await collection.insertOne(insertObj);
    console.log("insert report result: ", result);
}

const updateOrInsertReports = async (contractAddr, requestId, reports, threshold) => {
    try {
        await client.connect();

        const db = client.db(contractAddr);
        const requestCollections = db.collection(constants.REQUESTS_COLLECTION);

        // check if report exist. If yes then update, else insert
        const currentReports = await findReports(contractAddr, requestId);
        if (!currentReports) await insertReports(requestCollections, requestId, reports, threshold);
        else await updateReports(requestCollections, requestId, reports);
    } catch (error) {
        console.log("error while updating / inserting reports: ", error);
        throw error;
    }
}
module.exports = { updateOrInsertReports, updateReportsStatus };