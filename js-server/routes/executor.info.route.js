const express = require('express');
const router = express.Router();

const { query, param, body } = require('express-validator');
const { validate, isOraiAddress, isNotEmpty, isValidData } = require('./validate');
const { getExecutorsReport, getFinishedExecutorReports, claimExecutorReports } = require('../controllers/manageExecutorReport');

router.get('/:executor', validate([param('executor').notEmpty().isBase64().isLength({ min: 44, max: 44 }), query('contract_addr').notEmpty().isString().custom(value => isOraiAddress(value)), query('page_number').custom(value => isNotEmpty(value)), query('limit_per_page').custom(value => isNotEmpty(value))]), getExecutorsReport);

// force executor to be hexa so that it can be put in query params
router.get('/finished/:executor', validate([param('executor').notEmpty().isHexadecimal(), query('contract_addr').notEmpty().isString().custom(value => isOraiAddress(value)), query('page_number').custom(value => isNotEmpty(value)), query('limit_per_page').custom(value => isNotEmpty(value))]), getFinishedExecutorReports);

router.post('/claim', validate([body('data').isArray().custom(value => isValidData(value)), body('contract_addr').notEmpty().isString().custom(value => isOraiAddress(value))]), claimExecutorReports);

module.exports = router;