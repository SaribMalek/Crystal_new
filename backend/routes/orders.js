const router = require('express').Router();
const {
  createOrder,
  createStripeCheckoutSession,
  confirmStripeCheckoutSession,
  getOrders,
  getOrder,
  updateOrderStatus,
  getDashboardStats,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.post('/', createOrder);
router.post('/stripe/create-session', createStripeCheckoutSession);
router.post('/stripe/confirm-session', confirmStripeCheckoutSession);
router.get('/', protect, getOrders);
router.get('/dashboard/stats', protect, admin, getDashboardStats);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
