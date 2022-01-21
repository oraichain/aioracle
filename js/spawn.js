const exec = require('child_process').execFile;
require('dotenv').config({ path: '.env.testnet' });

let env = ['dev1', 'dev2'];
const executor_addrs = ["orai14n3tx8s5ftzhlxvq0w5962v60vd82h30rha573", "orai1602dkqjvh4s7ryajnz2uwhr8vetrwr8nekpxv5"];

for (let i = 0; i < 2; i++) {
    let fileName = './aioracle-executor-process';
    const ls = exec(fileName, {
        env: Object.assign(process.env, { NODE_ENV: env[i], EXECUTOR_ADDRESS: executor_addrs[i], REPLAY: process.env.REPLAY }),
        cwd: process.cwd()
    });

    ls.stdout.on('data', (data) => {
        console.log(`mnemonic index ${i} stdout: ${data}`);
    });
    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
}
