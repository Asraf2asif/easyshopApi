const express = require('express');
const router = express.Router();

const {
  getProducts,
  getTopProducts,
  createProduct,
  getProductById,
  deleteProduct,
  updateProduct,
  createProductReview,
  getNavCategory,
} = require('./controller.js');

const { protect, admin } = require('../user/middleware.js');

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.get('/top', getTopProducts);
router.get('/category', getNavCategory);
router
  .route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);
router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;
