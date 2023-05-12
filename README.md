# new-aioracle-demo

## Generate code and docs

```bash
# build contract
cw-build ../aioracle-contract -o packages/contracts-build/data/

# build contract schema
cw-build ../aioracle-contract -o packages/contracts-build/data/ -s

# build sdk typescript code
cw-gents ../aioracle-contract/ -o packages/contracts-sdk/src/

# gen docs
yarn docs

# update @oraichain/aioracle-contracts-sdk
yarn upgrade @oraichain/aioracle-contracts-sdk

# update comments:
git apply patches/contracts-sdk.patch
# edit contracts-sdk
git diff packages/contracts-sdk > patches/contracts-sdk.patch
# rollback
git checkout packages/contracts-sdk
```

## Deploy:

```bash
yarn oraicli wasm deploy ../oraiwasm/package/aioracle/aioracle_v2/artifacts/aioracle_v2.wasm --input '{"contract_fee":{"amount":"0","denom":"orai"}' --label 'aioracle contract' --gas 3000000

# contract: orai1s60a2vntfuv2ps6fs75fcrlrmea9xzr4k65zlg
```

## Run test:

### 1. Run server side

Enter the js-server directory: `cd js-server`

Create a new .env.mongo file with the below content:

```bash
ROOT_USERNAME=foo
ROOT_PASSWORD=bar
```

then start mongodb container

```bash
docker-compose -f docker-compose.mongo.yml up -d
```

next, start the server locally:

```bash
node index.js
```

### 2. Run client side

```bash
cd js && NODE_ENV=dev1 node index.js
cd js && NODE_ENV=dev2 node index.js
```

### 3. Test pricefeed flow with scripts (Oraichain testnet):

```
oscript_demo: orai1svngf2re7ze3259h2lqt98jatsma2kpjpw4ldl. Source: https://github.com/oraichain/oraiwasm/tree/master/package/price/oscript_price_special

dsources: binance: orai1y88tlgddntj66sn46qqlvtx3tp7tgl8sxxx6uk, coinbase: orai1v7ae3ptzqvztcx83fheafltq88hvdp2m5zas6f, coincap: orai19r36yr4v30ug7zl9rcgx2txdyyr357xc9rmpw9, coingecko: orai1nc6eqvnczmtqq8keplyrha9z7vnd5v9vvsxxgj,orai16usahha827ushfxrt26q27nshsxq6qd0xycwfn

Sources: https://github.com/oraichain/oraiwasm/tree/master/package/price/price_provider

service provider demo: orai1grgmdqmsusnd3hle536s83yyq4dh678vprkale. Source: https://github.com/oraichain/oraiwasm/tree/feature/new-aioracle/package/price/provider_demo

service name: price
```

### 4. Create a new request

```bash
cd client && node demo
```
