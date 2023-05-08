require('dotenv').config({ path: '.env.testnet' });
import { spawn } from 'child_process';
// import Cosmos from '@oraichain/cosmosjs';

// const cosmos = new Cosmos(
//   'https://testnet-lcd.orai.io',
//   'Oraichain-testnet'
// );

const parseMnemonics = () => {
  return process.env.MNEMONICS.substring(
    1,
    process.env.MNEMONICS.length - 1
  ).split(',');
}

const mnemonics = parseMnemonics();

for (let i = 0; i < 13; i++) {
  let fileName = 'index.js';
  const ls = spawn("node", [fileName], {
    env: Object.assign(process.env, {
      NODE_ENV: "dev1",
      MNEMONIC: mnemonics[i],
      START_STAGE: process.env.START_STAGE,
      REPLAY: process.env.REPLAY,
      DOCKER: true,
      PIN: process.env.PIN,
    }),
    cwd: process.cwd(),
  });

  ls.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  ls.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
}
