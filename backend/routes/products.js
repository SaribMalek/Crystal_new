const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getFeatured } = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/:slug', getProduct);
router.post('/', protect, admin, upload.array('images', 5), createProduct);
router.put('/:id', protect, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
