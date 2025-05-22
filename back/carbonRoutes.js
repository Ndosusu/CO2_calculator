// routes/carbonRoutes.js
const express = require('express');
const router = express.Router();
const { calculateCarbon } = require('./carbonController');
router.post('/calculate', calculateCarbon);

module.exports = router;
