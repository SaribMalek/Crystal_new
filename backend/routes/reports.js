const router = require('express').Router();
const { getReportsOverview, exportOrdersCsv } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/auth');

router.get('/overview', protect, admin, getReportsOverview);
router.get('/orders-csv', protect, admin, exportOrdersCsv);

module.exports = router;
