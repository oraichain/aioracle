# AI Executor program installation and execution guideline

## Installation

### 1. Deno

[Deno](https://deno.land/) is JavaScript & TypeScript runtime, which provides a secured environment for third parties to run scripts safely. Oraichain leverages this amazing feature and integrates Deno into the AI Executor program, where it downloads & runs deno scripts from the data source, test case, & oracle script providers. 

Deno protects the AI executors from malicious provider scripts that attempt to hack into their host machines and only enables the host network access to execute the scripts.

To install Deno, please follow the official [Deno's documentation](https://deno.land/#installation).

After finishing the Deno's installation process, you should be able to try running their simple program and receive the following result: ```Welcome to Deno!```

Then you can move on to the next step.

### 2. 