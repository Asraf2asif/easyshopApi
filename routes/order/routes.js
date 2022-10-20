const express = require('express');
const router = express.Router();
const { protect } = require('../user/middleware.js');

const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrderDelivered,
  getMyOrders,
  getOrders,
  deleteOrder,
} = require('./controller.js');

router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/delete').delete(protect, deleteOrder);
router.route('/:id/pay').put(protect, updateOrderToPaid);
// admin
router.route('/:id/deliver').put(protect, updateOrderToDelivered);
router.route('/:id/undeliver').put(protect, cancelOrderDelivered);
router.route('/').post(protect, addOrderItems).get(protect, getOrders);

module.exports = router;
