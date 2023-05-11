import path from 'path';

const contractDir = path.join(path.dirname(module.filename), 'data');

export const getContractDir = (name: 'aioracle-contract' = 'aioracle-contract') => {
  return path.join(contractDir, name + '.wasm');
};
