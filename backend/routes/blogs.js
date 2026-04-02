const express = require('express');
const {
  getBlogs,
  getAdminBlogs,
  getBlogBySlug,
  getAdminBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.get('/admin', protect, admin, getAdminBlogs);
router.get('/', getBlogs);
router.get('/admin/:id', protect, admin, getAdminBlogById);
router.get('/:slug', getBlogBySlug);
router.post('/', protect, admin, createBlog);
router.put('/:id', protect, admin, updateBlog);
router.delete('/:id', protect, admin, deleteBlog);

module.exports = router;
