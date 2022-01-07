# new-aioracle-demo

Deploy:

```bash
yarn oraicli wasm deploy ../oraiwasm/package/aioracle/aioracle_v2/artifacts/aioracle_v2.wasm --input '{"contract_fee":{"amount":"0","denom":"orai"},"executors":["AipQCudhlHpWnHjSgVKZ+SoSicvjH7Mp5gCFyDdlnQtn","AjqcDJ6IlUtYbpuPNRdsOsSGQWxuOmoEMZag29oROhSX"],"service_addr":"orai1ugq8erz3hz323yatueze5ageg2jywpfq3le794"}' --label 'production ow1155 nft for aiRight' --gas 3000000
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
yarn oraicli wasm execute orai1ars73g86y4kzajsgam5ee38npgmkq54dlzuz6w --input '{"request":{"threshold":2},"service":"price"}' --amount 4
```