const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, process.env.NODE_ENV ? `../.env.${process.env.NODE_ENV}` : "../.env") })
require('./db');

const express = require('express');
const { getProof } = require('./get-proof');
const { submitReport } = require('./submit-report');
const { checkSubmit } = require('./get-report');
const db = require('./db');
const { isWhiteListed } = require('./utils');
const app = express()
const port = 3000
app.use(express.json()); // built-in middleware for express

// root: 5cb7c54b6004e75cc859c4c0c33b1f8fee63c15ba0c5cf3556a5e3d5bbd69455

app.post('/get_proof', getProof);

app.post('/submit_report', submitReport)

app.get('/check_submit', checkSubmit)

app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
