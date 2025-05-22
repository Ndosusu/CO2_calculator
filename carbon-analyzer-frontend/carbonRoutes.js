// routes/carbonRoutes.js
const express = require('express');
const router = express.Router();
const { calculateCarbon } = require('../../carbon-analyzer-frontend/carbonController');

router.post('/calculate', calculateCarbon);

module.exports = router;
