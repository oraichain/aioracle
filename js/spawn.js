const exec = require('child_process').execFile;
const { spawn } = require('child_process');
require('dotenv').config({ path: '.env.testnet' });
const Cosmos = require('@oraichain/cosmosjs').default;

const cosmos = new Cosmos('https://testnet-lcd.orai.io', 'Oraichain-testnet');

const parseMnemonics = () => {
    let mnemonics = process.env.MNEMONICS.substring(1, process.env.MNEMONICS.length - 1).split(',');
    for (let mnemonic of mnemonics) {
        let childKey = cosmos.getChildKey(mnemonic);
        let pubkey = Buffer.from(cosmos.getPubKey(childKey.privateKey)).toString('base64');
        // console.log("pubkey: ", pubkey);
        const address = cosmos.getAddress(mnemonic);
        console.log(address);
    }
    return mnemonics;
}

const mnemonics = parseMnemonics();

for (let i = 0; i < 13; i++) {
    let fileName = 'index.js';
    const ls = spawn('node', [fileName], {
        env: Object.assign(process.env, { NODE_ENV: 'dev1', MNEMONIC: mnemonics[i], START_STAGE: process.env.START_STAGE, REPLAY: process.env.REPLAY }),
        cwd: process.cwd()
    });

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
}
