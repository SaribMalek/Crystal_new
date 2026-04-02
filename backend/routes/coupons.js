const router = require('express').Router();
const { getCoupons, validateCoupon, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect, admin } = require('../middleware/auth');

router.post('/validate', validateCoupon);
router.get('/', protect, admin, getCoupons);
router.post('/', protect, admin, createCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

module.exports = router;
