import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || { message: 'Network error' })
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
};

export const productAPI = {
  getProducts: (params) => API.get('/products', { params }),
  getProduct: (slug) => API.get(`/products/${slug}`),
  getFeatured: () => API.get('/products/featured'),
  createProduct: (data) => API.post('/products', data),
  updateProduct: (id, data) => API.put(`/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/products/${id}`),
};

export const categoryAPI = {
  getCategories: () => API.get('/categories'),
  getCategory: (slug) => API.get(`/categories/${slug}`),
  createCategory: (data) => API.post('/categories', data),
  updateCategory: (id, data) => API.put(`/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/categories/${id}`),
};

export const orderAPI = {
  createOrder: (data) => API.post('/orders', data),
  createStripeCheckoutSession: (data) => API.post('/orders/stripe/create-session', data),
  confirmStripeCheckoutSession: (session_id) => API.post('/orders/stripe/confirm-session', { session_id }),
  getOrders: (params) => API.get('/orders', { params }),
  getOrder: (id) => API.get(`/orders/${id}`),
  updateOrderStatus: (id, data) => API.put(`/orders/${id}/status`, data),
  getDashboardStats: () => API.get('/orders/dashboard/stats'),
};

export const userAPI = {
  getUsers: (params) => API.get('/users', { params }),
  toggleUserStatus: (id) => API.put(`/users/${id}/toggle-status`),
  deleteUser: (id) => API.delete(`/users/${id}`),
  getWishlist: () => API.get('/users/wishlist'),
  toggleWishlist: (productId) => API.post(`/users/wishlist/${productId}`),
  getAddresses: () => API.get('/users/addresses'),
  addAddress: (data) => API.post('/users/addresses', data),
  deleteAddress: (id) => API.delete(`/users/addresses/${id}`),
};

export const reviewAPI = {
  getReviews: (productId, params) => API.get(`/reviews/${productId}`, { params }),
  addReview: (productId, data) => API.post(`/reviews/${productId}`, data),
  getPendingReviews: () => API.get('/reviews/pending'),
  approveReview: (id) => API.put(`/reviews/${id}/approve`),
  deleteReview: (id) => API.delete(`/reviews/${id}`),
};

export const couponAPI = {
  validateCoupon: (data) => API.post('/coupons/validate', data),
  getCoupons: () => API.get('/coupons'),
  createCoupon: (data) => API.post('/coupons', data),
  updateCoupon: (id, data) => API.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => API.delete(`/coupons/${id}`),
};

export const reportAPI = {
  getOverview: () => API.get('/reports/overview'),
};

export const menuAPI = {
  getMenus: () => API.get('/menus'),
  getAdminMenus: () => API.get('/menus/admin'),
  createMenuItem: (data) => API.post('/menus', data),
  updateMenuItem: (id, data) => API.put(`/menus/${id}`, data),
  deleteMenuItem: (id) => API.delete(`/menus/${id}`),
};

export const contactAPI = {
  submit: (data) => API.post('/contact', data),
};

export const blogAPI = {
  getBlogs: (params) => API.get('/blogs', { params }),
  getAdminBlogs: () => API.get('/blogs/admin'),
  getBlog: (slug) => API.get(`/blogs/${slug}`),
  getAdminBlog: (id) => API.get(`/blogs/admin/${id}`),
  createBlog: (data) => API.post('/blogs', data),
  updateBlog: (id, data) => API.put(`/blogs/${id}`, data),
  deleteBlog: (id) => API.delete(`/blogs/${id}`),
};

export default API;
