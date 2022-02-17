const express = require('express');
const router = express.Router();
const { getProof } = require('../controllers/getProof');

const { body } = require('express-validator');
const { validate, isOraiAddress } = require('./validate');

router.post('/proof', validate([body('request_id').notEmpty().isNumeric(), body('contract_addr').notEmpty().isString().custom(value => isOraiAddress(value)), body('leaf').notEmpty().isObject()]), getProof);

module.exports = router;