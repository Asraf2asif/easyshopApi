const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, '`user` required'],
      ref: 'User',
    },
    orderItems: [
      {
        name: {
          type: String,
          required: [true, '`name` required'],
        },
        qty: {
          type: Number,
          required: [true, '`qty` required'],
        },
        image: {
          type: String,
          required: [true, '`image` required'],
        },
        price: {
          type: Number,
          required: [true, '`price` required'],
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: [true, '`product` required'],
          ref: 'Product',
        },
        category: {
          type: mongoose.Schema.Types.ObjectId,
          required: false,
          ref: 'Category',
        },
        rating: {
          type: Number,
          required: false,
          default: 0,
        },
        numReviews: {
          type: Number,
          required: false,
          default: 0,
        },
        discountPercentage: {
          type: Number,
          default: 0,
        },
        countInStock: {
          type: Number,
          required: false,
          default: 0,
        },
      },
    ],
    shippingAddress: {
      address: {
        type: String,
        required: [true, '`address` required'],
        trim: true,
        lowercase: true,
      },
      city: {
        type: String,
        required: [true, '`city` required'],
      },
      postalCode: {
        type: String,
        required: [true, '`postalCode` required'],
      },
      country: {
        type: String,
        required: [true, '`country` required'],
      },
    },
    paymentMethod: {
      type: String,
      required: [true, '`paymentMethod` required'],
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    taxPrice: {
      type: Number,
      required: [true, '`taxPrice` required'],
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: [true, '`shippingPrice` required'],
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: [true, '`totalPrice` required'],
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: [true, '`isPaid` required'],
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: [true, '`isDelivered` required'],
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    deliveredBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
