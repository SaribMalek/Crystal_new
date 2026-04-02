const router = require('express').Router();
const { getUsers, toggleUserStatus, deleteUser, getWishlist, toggleWishlist, getAddresses, addAddress, deleteAddress } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, admin, getUsers);
router.put('/:id/toggle-status', protect, admin, toggleUserStatus);
router.delete('/:id', protect, admin, deleteUser);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:productId', protect, toggleWishlist);
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:id', protect, deleteAddress);

module.exports = router;
