const router = require('express').Router();
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getCategories);
router.get('/:slug', getCategory);
router.post('/', protect, admin, upload.single('image'), createCategory);
router.put('/:id', protect, admin, upload.single('image'), updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
