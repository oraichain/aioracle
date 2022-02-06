const readline = require('readline');
const stdout = process.stdout;
const stdin = process.stdin;
const rl = readline.createInterface(stdin);
class Prompt {
    constructor(ask = 'password:', mask = '*') {
        this.ask = ask;
        this.input = '';
        this.mask = mask;
    }
    start() {
        return new Promise((resolve, reject) => {
            this.callback = resolve;
            stdout.write(this.ask);
            stdin.setRawMode && stdin.setRawMode(true);
            stdin.resume();
            stdin.setEncoding('utf-8');
            stdin.on('data', this.pn);
            stdin.on('error', reject);
        });
    }
    pn = (c) => {
        switch (c) {
            case '\u0004': // Ctrl-d
            case '\r':
            case '\n':
                return this.enter();
            case '\u0003': // Ctrl-c
                return this.ctrlc();
            default:
                // backspace or delete
                const charCode = c.charCodeAt(0);
                if (charCode === 8 || charCode === 127) return this.backspace();
                else return this.newchar(c);
        }
    };

    enter() {
        stdin.removeListener('data', this.pn);
        stdin.setRawMode && stdin.setRawMode(false);
        stdin.pause();
        console.log();
        this.callback(this.input);
    }

    ctrlc() {
        stdin.removeListener('data', this.pn);
        stdin.setRawMode && stdin.setRawMode(false);
        stdin.pause();
    }
    newchar(c) {
        this.input += c;
        stdout.write(typeof this.mask === 'string' ? this.mask : c);
    }
    backspace() {
        const pslen = this.ask.length;
        const y = rl.cursor;
        readline.cursorTo(stdout, pslen + this.input.length - 1, y);
        stdout.write(' ');
        readline.moveCursor(stdout, -1, y);
        this.input = this.input.slice(0, this.input.length - 1);
    }
}

const collectPin = async () => {
    const prompt = new Prompt('Please enter the PIN of your encrypted mnemonic to start running the AI Executor server: \n');
    const input = await prompt.start();
    return input;
};

module.exports = { collectPin };

// run();
