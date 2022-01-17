const exec = require('child_process').execFile;

let env = 'testnet';

for (let i = 0; i < 2; i++) {
    let fileName = './aioracle-executor-process-test-linux';
    const ls = exec(fileName, {
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
