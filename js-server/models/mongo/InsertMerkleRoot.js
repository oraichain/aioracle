const client = require('../../mongo');
const { constants } = require('../../config');


const insertMerkleRoot = async (contractAddr, merkleRoot, leaves) => {
    try {
        await client.connect();

        const db = client.db(contractAddr);
        const merkleCollection = db.collection(constants.MERKLE_ROOTS_COLLECTION);

        const insertObj = {
            merkleRoot,
            leaves,
        }
        const result = await merkleCollection.insertOne(insertObj);
        console.log("insert merkle root result: ", result);
    } catch (error) {
        console.log("error while inserting merkle root: ", error);
        throw error;
    }
}
module.exports = insertMerkleRoot;