const client = require('../../mongo');
const { constants } = require('../../config');

const findReports = async (contractAddr, requestId) => {
    try {
        await client.connect();

        const db = client.db(contractAddr);
        const requestCollections = db.collection(constants.REQUESTS_COLLECTION);
        const query = { requestId };
        const request = await requestCollections.findOne(query, { projection: { _id: 0 } });
        if (request && request.reports) return request.reports;
        return null;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
module.exports = findReports;