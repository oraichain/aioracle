import { createHash } from 'crypto';
import { Leaf } from 'src/dtos';
import { queryWasm } from './cosmjs';

const sha256 = (data: any) => {
  return createHash('sha256').update(data).digest();
}

export const verifyLeaf = async (
  contractAddr: string,
  requestId: number,
  leaf: Leaf,
  proofs: any[]
): Promise<boolean> => {
  let finalLeaf = { ...leaf, data: sha256(leaf.data).toString('hex') };
  console.log("leaf to verify: ", JSON.stringify(finalLeaf));
  const input = JSON.stringify({
    verify_data: {
      stage: requestId,
      data: Buffer.from(JSON.stringify(finalLeaf)).toString('base64'),
      proof: proofs
    }
  })
  const result = await queryWasm(contractAddr, input) as boolean;
  return result;
}
