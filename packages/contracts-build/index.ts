import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
// this is for polyfill implementation
import { SimulateCosmWasmClient } from '@terran-one/cw-simulate';
import path from 'path';

const contractDir = path.join(path.dirname(module.filename), 'data');

export type ContractName = 'aioracle-contract';

export const getContractDir = (contractName: ContractName = 'aioracle-contract') => {
  return path.join(contractDir, contractName + '.wasm');
};

export const deployContract = async <T>(client: SigningCosmWasmClient | SimulateCosmWasmClient, senderAddress: string, msg: T, label: string, contractName?: ContractName) => {
  return await client.deploy(senderAddress, getContractDir(contractName), msg, label, 'auto');
};
