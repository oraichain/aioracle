const express = require('express');
const router = express.Router();
const { submitReport } = require('../controllers/submitReport');
const { body } = require('express-validator');
const validate = require('./validate');

router.post('/', validate([body('requestId').notEmpty().isNumeric(), body('report').notEmpty().isObject(), body('report.executor').notEmpty().isBase64(), body('report.data').notEmpty().isBase64()]), submitReport);

module.exports = router;