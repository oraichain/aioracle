import BaseRepository from './base.repository';

export class MerkleRepository extends BaseRepository {

  async findLeaves (merkleRoot: string) {
    const query = { merkleRoot };
    const result = await this.merkleCollection.findOne(
      query,
      { projection: { _id: 0 }}
    );
    if (result && result.leaves) {
      try {
        return JSON.parse(result.leaves);
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  async findMerkleRoot (root: string) {
    const merkleTreeData = await this.merkleCollection.findOne({
      merkleRoot: root
    });
    return merkleTreeData ? merkleTreeData.merkleRoot : null;
  }

  async insertMerkleRoot (merkleRoot: string, leaves: string) {
    const insertObj = {
      merkleRoot,
      leaves,
    }
    return await this.merkleCollection.insertOne(insertObj);
  }
}
