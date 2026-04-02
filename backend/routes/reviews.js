const router = require('express').Router();
const { addReview, getReviews, approveReview, deleteReview, getPendingReviews } = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

router.get('/pending', protect, admin, getPendingReviews);
router.get('/:productId', getReviews);
router.post('/:productId', protect, addReview);
router.put('/:id/approve', protect, admin, approveReview);
router.delete('/:id', protect, admin, deleteReview);

module.exports = router;
