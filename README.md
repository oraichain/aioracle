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

### 3. Test pricefeed flow with scripts (Oraichain testnet):

```
oscript_demo: orai1svngf2re7ze3259h2lqt98jatsma2kpjpw4ldl. Source: https://github.com/oraichain/oraiwasm/tree/master/package/price/oscript_price_special

dsources: binance: orai1hmwh6rwtlyqd3pqnkze7y6hwpxsccq3ya7exez, coinbase: orai19j4c20352peuvvdgwswymf9jaud8pzjyezzzkt, coincap: orai19r36yr4v30ug7zl9rcgx2txdyyr357xc9rmpw9, coingecko: orai1nc6eqvnczmtqq8keplyrha9z7vnd5v9vvsxxgj,orai16usahha827ushfxrt26q27nshsxq6qd0xycwfn

Sources: https://github.com/oraichain/oraiwasm/tree/master/package/price/price_provider

service provider demo: orai1grgmdqmsusnd3hle536s83yyq4dh678vprkale. Source: https://github.com/oraichain/oraiwasm/tree/feature/new-aioracle/package/price/provider_demo

service name: price
```

### 4. Create a new request

```bash
yarn oraicli wasm execute orai15vjakfu32q27cvyq7hx32nqylsy7kzf96f7j8t --input '{"request":{"threshold":2},"service":"price"}' --amount 4
```