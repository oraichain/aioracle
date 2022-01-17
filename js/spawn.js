const { spawn } = require('child_process');

let env = 'testnet';

for (let i = 0; i < parseInt(process.env.NUM_ACCS) || 2; i++) {
    let fileName = 'index-testnet.js';
    const ls = spawn('node', [fileName], {
        env: Object.assign(process.env, { NODE_ENV: env, MNEMONIC_NUM: i }),
        cwd: process.cwd()
    });

    ls.stdout.on('data', (data) => {
        console.log(`mnemonic index ${i} stdout: ${data}`);
    });
    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
}
