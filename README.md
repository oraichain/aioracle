# new-aioracle-demo

Deploy:

```bash
RUSTFLAGS='-C link-arg=-s' cargo build -q --release --target wasm32-unknown-unknown
wasm-opt -Os target/wasm32-unknown-unknown/release/merkle_proof_tree.wasm -o target/merkle_proof_tree.wasm
```