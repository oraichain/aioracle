const client = require('../../mongo');
const { constants } = require('../../config');

const findLeaves = async (contractAddr, merkleRoot) => {
    try {
        await client.connect();

        const db = client.db(contractAddr);
        const merkleCollection = db.collection(constants.MERKLE_ROOTS_COLLECTION);

        const query = { merkleRoot };

        const result = await merkleCollection.findOne(query, { projection: { _id: 0 } });
        if (result && result.leaves) return result.leaves;
        return null;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
module.exports = findLeaves;