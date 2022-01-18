const express = require('express');
const router = express.Router();
const { checkSubmit, getReports } = require('../controllers/getReport');
const { getProof } = require('../controllers/getProof');

router.get('/check-submit', checkSubmit)

router.get('/get-reports', getReports)

router.post('/get-proof', getProof);

module.exports = router;