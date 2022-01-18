const express = require('express');
const router = express.Router();
const { submitReport } = require('../controllers/submitReport');
router.post('/', submitReport)

module.exports = router;