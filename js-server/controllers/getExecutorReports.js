const { constants } = require('../config');
const {
} = require('../models/merkleTree');
const { MongoDb } = require('../models/mongo');

const getExecutorsReport = async (req, res) => {
    const { executor } = req.params;
    let { contract_addr: contractAddr, page_number: pageNumber, limit_per_page: nPerPage } = req.query;
    pageNumber = parseInt(pageNumber);
    nPerPage = parseInt(nPerPage);
    const mongoDb = new MongoDb(contractAddr);
    try {
        const limit = nPerPage > 0 ? nPerPage : 5;
        const skip = pageNumber > 0 ? ((pageNumber - 1) * limit) : 0;
        // collect the root hex based on the request id to form a tree
        const { data, count } = await mongoDb.findExecutorReports(executor, skip, limit);

        return res.send({ code: 200, data, count })
    } catch (error) {
        console.log("error: ", error);
        return res.status(404).send({ code: 404, error: String(error) })
    }
}


module.exports = { getExecutorsReport };