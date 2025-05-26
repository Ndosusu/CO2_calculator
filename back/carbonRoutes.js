// routes/carbonRoutes.js
const express = require('express');
const router = express.Router();
const { calculateCarbon, getAllResults, getCategoryRanks } = require('./carbonController');
router.post('/calculate', calculateCarbon);
router.get('/compare', getAllResults);
router.get('/category-rank', getCategoryRanks);

module.exports = router;
