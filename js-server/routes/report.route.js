const express = require('express');
const router = express.Router();
const { submitReport } = require('../controllers/submitReport');
const { body, query } = require('express-validator');
const { validate, isValidRewards, isOraiAddress } = require('./validate');
const { getReports, checkSubmit } = require('../controllers/getReport');

router.get('/submitted', validate([query('request_id').notEmpty().isNumeric(), query('contract_addr').notEmpty().isString().custom(value => isOraiAddress(value))]), checkSubmit)

router.get('/reports', validate([query('request_id').notEmpty().isNumeric(), query('contract_addr').notEmpty().isString().custom(value => isOraiAddress(value))]), getReports)

router.post('/', validate([body('request_id').notEmpty().isNumeric(), body('report').notEmpty().isObject(), body('report.executor').notEmpty().isBase64().isLength({ min: 44, max: 44 }), body('report.data').notEmpty().isBase64(), body('report.signature').notEmpty().isBase64().isLength({ min: 88, max: 88 }), body('report.rewards').isArray().custom(rewards => isValidRewards(rewards))]), submitReport);

module.exports = router;