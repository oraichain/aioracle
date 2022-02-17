const express = require('express');
const router = express.Router();

const { query, param } = require('express-validator');
const { validate, isOraiAddress, isNotEmpty } = require('./validate');
const { getExecutorsReport } = require('../controllers/getExecutorReports');

router.get('/:executor', validate([param('executor').notEmpty().isBase64().isLength({ min: 44, max: 44 }), query('contract_addr').notEmpty().isString().custom(value => isOraiAddress(value)), query('page_number').custom(value => isNotEmpty(value)), query('limit_per_page').custom(value => isNotEmpty(value))]), getExecutorsReport);

module.exports = router;