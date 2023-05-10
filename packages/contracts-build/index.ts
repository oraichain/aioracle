import path from 'path';

const contractDir = path.join(path.dirname(module.filename), 'data');

export const getContractDir = (name: 'aioracle_contract' = 'aioracle_contract') => {
  return path.join(contractDir, name + '.wasm');
};
