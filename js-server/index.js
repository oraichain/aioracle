require('./db');

const express = require('express');
const cors = require('cors');
const app = express()
const port = 8080
const host = '0.0.0.0'
app.use(express.json()); // built-in middleware for express
app.use(cors()) // simplest form, allow all cors
const client = require('./mongo');
const reportInfoRouter = require('./routes/reportInfo.route');
const submitReportRouter = require('./routes/submitReport.route');
const submitReportInterval = require('./submitReportInterval');
const { constants, env } = require('./config');

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

app.use('/report-info', reportInfoRouter);

app.use('/submit-report', submitReportRouter)

app.listen(port, host, async () => {
  console.log(`AI Oracle server listening at http://${host}:${port}`)
})

// interval process that handles submitting merkle roots onto the blockchain network
const intervalProcess = async () => {
  let gasPrices = constants.BASE_GAS_PRICES;
  await client.connect();
  while (true) {
    try {
      console.log("gas prices: ", gasPrices);
      await submitReportInterval(gasPrices);
    } catch (error) {
      console.log("error: ", error);
      if (error.status === 400) {
        // increase tx fees
        gasPrices += 0.002;
      }
    } finally {
      await new Promise(r => setTimeout(r, 10000));
    }
  }
}

intervalProcess();