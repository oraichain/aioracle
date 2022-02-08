const { constants, env } = require('../../config');
const client = require('../../mongo');


class MongoDb {
    constructor(contractAddr) {
        this.contractAddr = contractAddr;
        this.db = client.db(this.contractAddr);
        this.requestCollections = this.db.collection(constants.REQUESTS_COLLECTION);
        this.merkleCollection = this.db.collection(constants.MERKLE_ROOTS_COLLECTION);
    }

    bulkUpdateRequests = async (requestsData, txHash) => {
        // update the requests that have been handled in the database
        let bulkUpdateOps = [];
        for (let { requestId, root } of requestsData) {
            bulkUpdateOps.push({
                "updateOne": {
                    "filter": { _id: requestId, requestId },
                    "update": { "$set": { "txhash": txHash, "submitted": true, "merkle_root": root } }
                }
            })
        }

        const bulkResult = await this.requestCollections.bulkWrite(bulkUpdateOps);
        console.log("bulk result: ", bulkResult);
    }

    findLeaves = async (merkleRoot) => {
        try {
            const query = { merkleRoot };

            const result = await this.merkleCollection.findOne(query, { projection: { _id: 0 } });
            if (result && result.leaves) return result.leaves;
            return null;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    findMerkleRoot = async (root) => {
        const merkleTreeData = await this.merkleCollection.findOne({ root });
        return merkleTreeData ? merkleTreeData.merkleRoot : null;
    }

    findReports = async (requestId) => {
        try {
            const query = { _id: requestId, requestId };
            const request = await this.requestCollections.findOne(query, { projection: { _id: 0 } });
            if (request && request.reports) return request.reports;
            return null;
        } catch (error) {
            console.log(error);
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

    updateReports = async (requestId, reports) => {
        const filter = { requestId };
        // create a document that sets the plot of the movie
        const updateDoc = {
            $set: {
                reports
            },
        };

        const result = await this.requestCollections.updateOne(filter, updateDoc);
        console.log("update reports result: ", result);
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

    // insertReports = async (requestId, reports, threshold) => {
    //     const insertObj = {
    //         requestId,
    //         reports,
    //         threshold
    //     }
    //     const result = await this.requestCollections.insertOne(insertObj);
    //     console.log("insert report result: ", result);
    // }

    updateUniqueReports = async (requestId, reports, threshold) => {
        const filter = { _id: requestId, requestId, threshold };
        // add unique report to the list of reports.
        const updateDoc = {
            $addToSet: {
                reports
            },
        };

        const result = await this.requestCollections.updateOne(filter, updateDoc, { upsert: true }); // upsert means if does not exist then create document
        console.log("update reports result: ", result);
    }

    // updateOrInsertReports = async (requestId, reports, threshold) => {
    //     try {
    //         // check if report exist. If yes then update, else insert
    //         const currentReports = await this.findReports(requestId);
    //         if (!currentReports) await this.insertReports(requestId, reports, threshold);
    //         else await this.updateReports(requestId, reports);
    //     } catch (error) {
    //         console.log("error while updating / inserting reports: ", error);
    //         throw error;
    //     }
    // }
}

const mongoDb = new MongoDb(env.CONTRACT_ADDRESS);

module.exports = { mongoDb, MongoDb };