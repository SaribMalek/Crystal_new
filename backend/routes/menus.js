const router = require('express').Router();
const { protect, admin } = require('../middleware/auth');
const {
  getMenus,
  getAdminMenus,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');

router.get('/', getMenus);
router.get('/admin', protect, admin, getAdminMenus);
router.post('/', protect, admin, createMenuItem);
router.put('/:id', protect, admin, updateMenuItem);
router.delete('/:id', protect, admin, deleteMenuItem);

module.exports = router;
