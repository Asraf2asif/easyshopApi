const asyncHandler = require('express-async-handler');
const Order = require('./model.js');
const { ErrorCustom } = require('../../utils/error.js');
const User = require('../user/model.js');
const { getQuerys } = require('../../utils/getQuerys.js');
const { isEmpty, errorMsgRedefined } = require('../../utils/helperFunct.js');
const { adminSelf } = require('../user/middleware.js');

const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    throw new ErrorCustom('No order items', 400);
    return;
  } else {
    try {
      const order = new Order({
        orderItems,
        user: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      const createdOrder = await order.save();

      res.status(201).json(createdOrder);
    } catch (err) {
      console.log(err);
    }
  }
});

const orderById = async (id, reqUser, populateUser = '') => {
  const errHandle = () => {
    throw new ErrorCustom(
      `Order id: "${id}" not found or Authorization error`,
      404
    );
  };

  try {
    let order;
    const query = {
      _id: id,
      ...(reqUser.isAdmin === false
        ? {
            user: { _id: reqUser._id },
          }
        : {}),
    };
    if (populateUser !== '') {
      order = await Order.findOne(query)
        .populate('user', '_id name isAdmin email')
        .populate('deliveredBy', '_id name isAdmin email');
    } else {
      order = await Order.findOne(query);
    }

    if (order && order !== null) {
      return order;
    } else {
      errHandle();
    }
  } catch (error) {
    console.log(error);
    errHandle();
  }
};

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderById(req.params.id, req.user, 'populateUser');
  res.json(order);
});

const updateOrderToPaid = asyncHandler(async (req, res) => {
  try {
    const order = await orderById(req.params.id, req.user);
    const {
      id,
      status,
      update_time,
      payer: { email_address },
    } = req.body;

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id,
      status,
      update_time,
      email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    console.log(error);
    throw new ErrorCustom('Order save error', 400);
  }
});

const deleteOrder = asyncHandler(async (req, res) => {
  try {
    const order = await orderById(req.params.id, req.user);
    
    if (order) {
      if (order.user._id.toString() !== req.user._id.toString())
        throw new ErrorCustom("Can't delete other user order", 400);

      if (order.isPaid === true)
        throw new ErrorCustom("Can't delete paid order", 400);

      if (order.isDelivered === true)
        throw new ErrorCustom("Can't delete delivered order", 400);

      await order.remove();
      res.json({ message: 'User removed' });
    } else {
      throw new ErrorCustom('order not found', 404);
    }
  } catch (err) {
    console.log(err)
    throw new ErrorCustom('order delete error', 404);
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json(orders);
});

// admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  try {
    const order = await orderById(req.params.id, req.user);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.deliveredBy = req.user._id;

      const updatedOrder = await order.save();

      res.json(updatedOrder);
    } else {
      throw new ErrorCustom('Order not found', 404);
    }
  } catch (error) {
    console.log(error);
    throw new ErrorCustom('Order not found or Server error', 404);
  }
});

// admin
const cancelOrderDelivered = asyncHandler(async (req, res) => {
  try {
    const order = await orderById(req.params.id, req.user);

    if (
      order &&
      (!order.deliveredBy ||
        isEmpty(order.deliveredBy) ||
        (await adminSelf(req, res, order.deliveredBy)) === true)
    ) {
      order.isDelivered = false;
      delete order.deliveredAt;
      order.deliveredBy = null;

      const updatedOrder = await order.save();

      res.json(updatedOrder);
    } else {
      throw new ErrorCustom('Unauthorized', 400);
    }
  } catch (err) {
    throw new ErrorCustom(errorMsgRedefined(err), 400);
  }
});

// admin
const getOrders = asyncHandler(async (req, res) => {
  const {
    query: { keyword, key: keyName, sort = '-createdAt', pageNumber },
  } = req;

  let query = await getQuerys(keyword, keyName, { user: User });
  // console.log(query['$and']);
  const pageSize = 8;
  const page = Number(pageNumber) || 1;

  const orders = await Order.find({ ...query })
    .populate('user', '_id name')
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  const count = await Order.countDocuments({ ...query });

  res.json({ orders, page, pages: Math.ceil(count / pageSize) });
});

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrderDelivered,
  getMyOrders,
  getOrders,
  deleteOrder,
};
