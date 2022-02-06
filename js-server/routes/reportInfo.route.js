const express = require('express');
const router = express.Router();
const { checkSubmit, getReports } = require('../controllers/getReport');
const { getProof } = require('../controllers/getProof');

const { body, query } = require('express-validator');
const { validate, isOraiAddress } = require('./validate');

router.get('/check-submit', validate([query('request_id').notEmpty().isNumeric(), query('contract_addr').notEmpty().isString().custom(value => isOraiAddress(value))]), checkSubmit)

router.get('/get-reports', validate([query('request_id').notEmpty().isNumeric(), query('contract_addr').notEmpty().isString().custom(value => isOraiAddress(value))]), getReports)

router.post('/get-proof', validate([body('request_id').notEmpty().isNumeric(), body('contract_addr').notEmpty().isString().custom(value => isOraiAddress(value)), body('leaf').notEmpty().isObject()]), getProof);

module.exports = router;