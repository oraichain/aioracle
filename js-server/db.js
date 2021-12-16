const level = require('level');

const db = level('merkle-proof');

module.exports = db;

