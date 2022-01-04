# new-aioracle-demo

Deploy:

```bash
RUSTFLAGS='-C link-arg=-s' cargo build -q --release --target wasm32-unknown-unknown && wasm-opt -Os target/wasm32-unknown-unknown/release/merkle_proof_tree.wasm -o target/merkle_proof_tree.wasm

yarn oraicli wasm deploy ../new-aioracle-demo/target/merkle_proof_tree.wasm --input '{"service_addr":"orai14mxup548ltdha4xpt8uum37q59w85phx20nkdh"}' --label 'test new aioracle demo' --gas 3000000
```

Run test:

### 1. Run server side

```bash
cd js-server && node index.js
```

### 2. Run client side

```bash
cd js && NODE_ENV=dev1 node index.js
cd js && NODE_ENV=dev2 node index.js
```

### 3. Create a new request

```bash
yarn oraicli wasm execute orai1ars73g86y4kzajsgam5ee38npgmkq54dlzuz6w --input '{"request":{"threshold":2}}'
```