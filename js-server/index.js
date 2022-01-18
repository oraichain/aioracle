require('./db');

const express = require('express');
const cors = require('cors');
const app = express()
const port = 8080
const host = '0.0.0.0'
app.use(express.json()); // built-in middleware for express
app.use(cors()) // simplest form, allow all cors
const reportInfoRouter = require('./routes/reportInfo.route');
const submitReportRouter = require('./routes/submitReport.route');

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

app.use('/report-info', reportInfoRouter);

app.use('/submit-report', submitReportRouter)

app.listen(port, host, async () => {
  console.log(`AI Oracle server listening at http://${host}:${port}`)
})
