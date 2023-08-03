import { Controller, Body, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProofLeaf } from '../dtos';
import { ExecutorService } from '../services';
import { MerkleRepository } from 'src/repositories/mongo';
import { MerkleProofTree, sha256 } from 'src/utils';

@Controller('/proof')
export class ProofController {
  constructor(private executorService: ExecutorService) {}

  @Post('/')
  async getProof(@Res() res: Response, @Body() body: ProofLeaf) {
    const repo = new MerkleRepository();
    await repo.db(body.contract_addr);

    let data = await this.executorService.getRequest(
      body.contract_addr,
      body.request_id,
    );

    if (!data?.merkle_root) {
      return res.status(HttpStatus.OK).json({
        code: HttpStatus.OK,
        message: 'Waiting for the merkle root',
      });
    }
    const leaves = await repo.findLeaves(data.merkle_root);
    // collect the root hex based on the request id to form a tree
    const tree = new MerkleProofTree(leaves);
    const hexLeaf = sha256(JSON.stringify(body.leaf));
    const root = tree.getHexRoot();
    // special case, tree with only root
    if (hexLeaf.toString('hex') === root) {
      return res.status(HttpStatus.OK).json({
        code: HttpStatus.OK,
        proofs: [],
        root: tree.getHexRoot(),
      });
    }

    const proofs = tree.getHexProof(hexLeaf);
    if (proofs.length === 0 && root !== hexLeaf.toString('hex')) {
      return res.status(HttpStatus.NOT_FOUND).json({
        code: HttpStatus.NOT_FOUND,
      });
    }
    return res.status(HttpStatus.OK).json({
      code: HttpStatus.OK,
      proofs,
      root: root,
    });
  }
}
