const { constants } = require('../config');
const {
} = require('../models/merkleTree');
const { MongoDb } = require('../models/mongo');

const getExecutorsReport = async (req, res) => {
    const { executor } = req.params;
    let { contract_addr: contractAddr, page_number: pageNumber, limit_per_page: nPerPage } = req.query;
    pageNumber = parseInt(pageNumber);
    nPerPage = parseInt(nPerPage);
    console.log("page number: ", pageNumber)
    console.log("number of pages: ", nPerPage);
    console.log("executor: ", executor)
    const mongoDb = new MongoDb(contractAddr);
    try {
        const limit = nPerPage > 0 ? nPerPage : 5;
        const skip = pageNumber > 0 ? ((pageNumber - 1) * limit) : 0;
        console.log("skip: ", skip)
        // collect the root hex based on the request id to form a tree
        const cursor = mongoDb.db.collection(constants.mongo.EXECUTORS_COLLECTION)
            .find({ executor })
            .sort({ requestId: -1 })
            .skip(skip)
            .limit(limit);
        const count = await cursor.count();

        return res.send({ code: 200, data: await cursor.toArray(), count })
    } catch (error) {
        console.log("error: ", error);
        return res.status(404).send({ code: 404, error: String(error) })
    }
}


module.exports = { getExecutorsReport };