const { constants, env, getCors } = require('./config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express()
const port = env.PORT
const host = env.HOST
app.use(express.json()); // built-in middleware for express
app.use(cors(getCors())) // custom cors
app.use(helmet()); // secure http headers
const client = require('./mongo');
const proofRouter = require('./routes/proof.info.route');
const reportRouter = require('./routes/report.route');
const reportTestnetRouter = require('./routes/report-testnet.route');
const executorInfoRouter = require('./routes/executor.info.route');
const submitReportInterval = require('./submitReportInterval');
// const { index } = require('./models/elasticsearch/index');
// const { getCurrentDateInfo } = require('./utils');
const { MongoDb } = require('./models/mongo');
//const { mongoDb } = require('./models/mongo');

const start = (mongoDb) => {

  app.get('/', (req, res) => {
    res.send("Welcome to the AI Oracle server");
  });

  /* Error handler middleware */
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ 'message': err.message });

    return;
  });

  // cleanup funciton to close the mongo client
  const cleanup = (event) => {
    console.log("event to close: ", event);
    client.close().then(process.exit()); // Close MongodDB Connection when Process ends
  }

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  app.use('/proof', proofRouter);

  app.use('/executor', executorInfoRouter)

  app.use('/report', reportRouter)

  // special submit report router for benchmarking
  if (env.NETWORK_TYPE === "testnet" || env.NETWORK_TYPE === "local") {
    app.use('/report-testnet', reportTestnetRouter);
    app.use('/test', reportTestnetRouter);
  }

  app.use('/report', reportRouter)

  app.listen(port, host, () => {
    console.log(`AI Oracle server listening at http://${host}:${port}`)

  })

}

// interval process that handles submitting merkle roots onto the blockchain network
const intervalProcess = async () => {
  let gasPrices = constants.BASE_GAS_PRICES;
  // create indexes for mongo data
  await client.connect();
  const mongoDb = new MongoDb(env.CONTRACT_ADDRESS);
  await mongoDb.indexData();
  start(mongoDb);
  while (true) {
    try {
      console.log("gas prices: ", gasPrices);
      await submitReportInterval(gasPrices, env.MNEMONIC, mongoDb);
    } catch (error) {
      console.log("error in interval process: ", error);
      // index the error to elasticsearch
      // index('interval-errors', { error: String(error), ...getCurrentDateInfo() });
      if (error.status === 400) {
        // increase tx fees
        gasPrices += 0.002;
      }
    } finally {
      await new Promise(r => setTimeout(r, env.PROCESS_INTERVAL));
    }
  }
}

intervalProcess();