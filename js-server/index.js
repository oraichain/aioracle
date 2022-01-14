const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : ".env") })
require('./db');

const express = require('express');
const { getProof } = require('./get-proof');
const { submitReport } = require('./submit-report');
const { checkSubmit, getReports } = require('./get-report');
const db = require('./db');
const app = express()
const port = 8080
const host = '0.0.0.0'
app.use(express.json()); // built-in middleware for express

app.post('/get_proof', getProof);

app.post('/submit_report', submitReport)

app.get('/check_submit', checkSubmit)

app.get('/get_reports', getReports)

app.listen(port, host, async () => {
  console.log(`AI Oracle server listening at http://${host}:${port}`)
})
