require('./db');
const { constants, env, getCors } = require('./config');

const express = require('express');
const cors = require('cors');
const app = express()
const port = env.PORT
const host = env.HOST
app.use(express.json()); // built-in middleware for express
app.use(cors(getCors())) // custom cors
const client = require('./mongo');
const proofRouter = require('./routes/proof.info.route');
const reportRouter = require('./routes/report.route');
const executorInfoRouter = require('./routes/executor.info.route');
const submitReportInterval = require('./submitReportInterval');
const { index } = require('./models/elasticsearch/index');
const { getCurrentDateInfo } = require('./utils');
const { mongoDb } = require('./models/mongo');

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

app.listen(port, host, async () => {
  console.log(`AI Oracle server listening at http://${host}:${port}`)
})

// interval process that handles submitting merkle roots onto the blockchain network
const intervalProcess = async () => {
  let gasPrices = constants.BASE_GAS_PRICES;
  await client.connect();
  // create indexes for mongo data
  await mongoDb.indexData();
  while (true) {
    try {
      console.log("gas prices: ", gasPrices);
      await submitReportInterval(gasPrices, env.MNEMONIC);
    } catch (error) {
      console.log("error: ", error);
      // index the error to elasticsearch
      index('interval-errors', { error: String(error), ...getCurrentDateInfo() });
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