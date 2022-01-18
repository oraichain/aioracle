const express = require('express');
const router = express.Router();
const { checkSubmit, getReports } = require('../controllers/getReport');
const { getProof } = require('../controllers/getProof');

const { body, query } = require('express-validator');
const validate = require('./validate');

router.get('/check-submit', validate([query('request_id').notEmpty().isNumeric(), query('contract_addr').notEmpty().exists({ checkNull: true }).isString()]), checkSubmit)

router.get('/get-reports', validate([query('request_id').notEmpty().isNumeric(), query('contract_addr').notEmpty().exists({ checkNull: true }).isString()]), getReports)

router.post('/get-proof', validate([body('requestId').notEmpty().isNumeric(), body('leaf').notEmpty().exists({ checkNull: true }).isObject()]), getProof);

module.exports = router;