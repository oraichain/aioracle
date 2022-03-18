const { constants, env } = require('../../config');
const client = require('../../mongo');


class MongoDb {
    constructor(contractAddr) {
        this.contractAddr = contractAddr;
        this._db = client.db(this.contractAddr);
        this.requestCollections = this._db.collection(constants.mongo.REQUESTS_COLLECTION);
        this.merkleCollection = this._db.collection(constants.mongo.MERKLE_ROOTS_COLLECTION);
        this.executorCollection = this._db.collection(constants.mongo.EXECUTORS_COLLECTION);
        this.MAX_LIMIT = 20;
    }

    indexFinishedRequests = async () => {
        await this._db.createIndex(constants.mongo.REQUESTS_COLLECTION, { "submitted": -1 });
    }

    indexExecutorReport = async () => {
        await this._db.createIndex(constants.mongo.EXECUTORS_COLLECTION, { "executor": -1, "requestId": -1 })
        await this._db.createIndex(constants.mongo.EXECUTORS_COLLECTION, { "requestId": -1 })
        await this._db.createIndex(constants.mongo.EXECUTORS_COLLECTION, { "executor": -1, "claimed": -1 })
    }

    indexData = async () => {
        await this.indexFinishedRequests();
        await this.indexExecutorReport();
    }

    insertExecutorReport = async (requestId, executor, report) => {
        // request ID + executor should be unique
        const insertObj = {
            _id: `${requestId}-${executor}`, // force the executor report to be unique
            requestId,
            executor,
            report,
            claimed: false,
        }
        this.executorCollection.insertOne(insertObj).then(result => console.log("insert executor report result: ", result));
    }

    removeExecutorReport = async (requestId, executor) => {
        const result = await this.executorCollection.deleteOne({ requestId, executor });
        console.log("insert remove executor result: ", result);
    }

    bulkUpdateRequests = async (requestsData, txHash) => {
        // update the requests that have been handled in the database
        let bulkUpdateOps = [];
        for (let { requestId, root } of requestsData) {
            bulkUpdateOps.push({
                "updateOne": {
                    "filter": { _id: requestId, requestId },
                    "update": { "$set": { "txhash": txHash, "submitted": true, "merkleRoot": root } }
                }
            })
        }

        const bulkResult = await this.requestCollections.bulkWrite(bulkUpdateOps);
        console.log("bulk result: ", bulkResult);
    }

    // mark record as claimed for querying purpose
    bulkUpdateExecutorReports = async (executorsData) => {
        // update the requests that have been handled in the database
        let bulkUpdateOps = [];
        for (let { executor, request_id: requestId } of executorsData) {
            // console.log("request id: ", requestId);
            // console.log("executor: ", executor)
            bulkUpdateOps.push({
                "updateOne": {
                    "filter": { executor, requestId },
                    "update": { "$set": { "claimed": true } }
                }
            })
        }
        const bulkResult = await this.executorCollection.bulkWrite(bulkUpdateOps);
        console.log("bulk result: ", bulkResult);
    }

    findLeaves = async (merkleRoot) => {
        try {
            const query = { merkleRoot: merkleRoot };

            const result = await this.merkleCollection.findOne(query, { projection: { _id: 0 } });
            if (result && result.leaves) return JSON.parse(result.leaves);
            return null;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    findMerkleRoot = async (root) => {
        const merkleTreeData = await this.merkleCollection.findOne({ merkleRoot: root });
        return merkleTreeData ? merkleTreeData.merkleRoot : null;
    }

    findReports = async (requestId, skip, limit) => {
        try {
            const query = { requestId };
            const cursor = this.executorCollection.find(query, { projection: { _id: 0 } });
            const count = await cursor.count();
            const data = cursor.skip(skip)
                .limit(limit > this.MAX_LIMIT ? this.MAX_LIMIT : limit);
            return { data: await data.toArray(), count };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    findExecutorReports = async (executor, skip, limit) => {
        try {
            const cursor = this.executorCollection
                .find({ executor })
                .sort({ requestId: -1 });
            const count = await cursor.count();
            const data = cursor.skip(skip)
                .limit(limit > this.MAX_LIMIT ? this.MAX_LIMIT : limit);
            return { data: await data.toArray(), count };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    findFinishedExecutorReports = async (executor, skip, limit, claimed) => {
        try {
            // find a list of reports that has the given executor & request id in the list of submitted request id. Note that the claim field must be false
            let executorResults = await this.executorCollection.find({ executor, $or: [{ claimed: null }, { claimed: false }] }).sort({ requestId: -1 }).toArray();
            let requestIds = executorResults.map(res => res.requestId);
            let requestResults = await this.requestCollections.find({ "submitted": true, _id: { $in: requestIds } }).sort({ _id: -1 }).skip(skip).limit(limit > this.MAX_LIMIT ? this.MAX_LIMIT : limit).toArray();
            executorResults = executorResults.filter(result => requestResults.find(reqResult => result.requestId === reqResult.requestId));
            return { data: executorResults };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    findReport = async (requestId, executor) => {
        try {
            const query = { _id: `${requestId}-${executor}` };
            const result = await this.executorCollection.findOne(query, { projection: { _id: 0 } });
            if (result && result.report) return result.report;
            return null;
        } catch (error) {
            console.log("error in find report: ", error);
            throw error;
        }
    }

    findRequest = async (requestId) => {
        const query = { _id: requestId, requestId, submitted: null };
        const request = await this.requestCollections.findOne(query, { projection: { _id: 0 } });
        return request;
    }

    findSubmittedRequest = async (requestId) => {
        const query = { _id: requestId, requestId, submitted: true };
        const request = await this.requestCollections.findOne(query, { projection: { _id: 0 } });
        if (!request) return { reports: null, submitted: null, threshold: null }
        return request;

    }

    findUnsubmittedRequests = async () => {
        const queryResult = await this.requestCollections.find({ submitted: null, threshold: { $ne: null } }).limit(10).sort({ _id: -1, requestId: -1 }).toArray();
        return queryResult;
    }

    queryExecutorReportsWithThreshold = async (requestId, threshold) => {
        const results = await this.executorCollection.find({ requestId }).limit(threshold > this.MAX_LIMIT ? this.MAX_LIMIT : threshold).toArray();
        return results;
    }

    countExecutorReports = async (requestId) => {
        try {
            const result = await this.executorCollection.find({ requestId }).count();
            return result;
        } catch (error) {
            console.log("error counting the reports:", error);
            throw error;
        }
    }

    insertMerkleRoot = async (merkleRoot, leaves) => {
        try {

            const insertObj = {
                merkleRoot,
                leaves,
            }
            console.log("insert obj: ", insertObj);
            const result = await this.merkleCollection.insertOne(insertObj);
            console.log("insert merkle root result: ", result);
        } catch (error) {
            console.log("error while inserting merkle root: ", error);
            throw error;
        }
    }

    updateReports = async (requestId, numRedundant) => {
        const reportsResult = await this.queryExecutorReportsWithThreshold(requestId, numRedundant);
        const ids = reportsResult.map(result => result._id);
        const removeResult = await this.executorCollection.deleteMany({ _id: { $in: ids } });
        console.log("update executor reports result: ", removeResult);
    }

    updateReportsStatus = async (requestId) => {

        const filter = { _id: requestId, requestId };
        // create a document that sets the plot of the movie
        const updateDoc = {
            $set: {
                submitted: true
            },
        };

        const result = await this.requestCollections.updateOne(filter, updateDoc);
        console.log("update reports result: ", result);
    }

    removeRedundantRequests = async (requestId) => {
        const filter = { requestId, submitted: null };
        const result = await this.requestCollections.deleteMany(filter);
        console.log("insert report result: ", result);
    }

    // updateUniqueReports = async (requestId, reports, threshold) => {
    //     const filter = { _id: requestId, requestId, threshold };
    //     // add unique report to the list of reports.
    //     const updateDoc = {
    //         $addToSet: {
    //             reports
    //         },
    //     };

    //     const result = await this.requestCollections.updateOne(filter, updateDoc, { upsert: true }); // upsert means if does not exist then create document
    //     console.log("update reports result: ", result);
    // }

    insertRequest = async (requestId, threshold) => {
        const filter = { _id: requestId, requestId };
        // add unique report to the list of reports
        const updateDoc = {
            $setOnInsert: {
                _id: requestId, requestId, threshold
            }
        }
        this.requestCollections.updateOne(filter, updateDoc, { upsert: true }).then(result => console.log("insert request result: ", result)); // upsert means if does not exist then create document
    }
}

module.exports = { MongoDb };