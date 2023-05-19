import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { AioracleContractTypes } from '@oraichain/aioracle-contracts-sdk/src';
import { readFileSync } from 'fs';
import path from 'path';

export type ContractName = 'aioracle-contract';
export type InstantiateMsg = AioracleContractTypes.InstantiateMsg;

const contractDir = path.join(path.dirname(module.filename), '..', 'data');

export const getContractDir = (contractName: ContractName = 'aioracle-contract') => {
  return path.join(contractDir, contractName + '.wasm');
};

export const deployContract = async (client: SigningCosmWasmClient, senderAddress: string, contractName?: ContractName, msg?: InstantiateMsg, label?: string) => {
  // upload and instantiate the contract
  const wasmBytecode = readFileSync(getContractDir(contractName));
  const uploadRes = await client.upload(senderAddress, wasmBytecode, 'auto');
  const initRes = await client.instantiate(senderAddress, uploadRes.codeId, msg ?? {}, label ?? contractName, 'auto');
  return { ...uploadRes, ...initRes };
};
