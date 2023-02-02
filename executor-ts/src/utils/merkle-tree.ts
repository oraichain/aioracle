import { createHash } from 'crypto';
import { Leaf } from 'src/dtos';
import { queryWasmRaw } from './cosmjs';

const sha256 = (data: any) => {
  return createHash('sha256').update(data).digest();
}

export const verifyLeaf = async (
  contractAddr: string,
  requestId: number,
  leaf: Leaf,
  proofs: any
) => {
  let finalLeaf = { ...leaf, data: sha256(leaf.data).toString('hex') };
  console.log("leaf to verify: ", JSON.stringify(finalLeaf));
  const input = JSON.stringify({
      verify_data: {
          stage: requestId,
          data: Buffer.from(JSON.stringify(finalLeaf)).toString('base64'),
          proof: proofs
      }
  })
  return queryWasmRaw(contractAddr, input);
}
