const mongoose = require('mongoose');

const reviewShema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '`name` required'],
    },
    rating: {
      type: Number,
      required: [true, '`rating` required'],
    },
    comment: {
      type: String,
      required: [true, '`comment` required'],
    },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, '`user` required'],
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, '`name` required'],
      trim: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: [true, '`image` required'],
    },
    images: [
      {
        type: String,
      },
    ],
    brand: {
      type: String,
      required: [true, '`brand` required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, '`category` required'],
      ref: 'Category',
    },
    description: {
      type: String,
      required: [true, '`description` required'],
    },
    reviews: [reviewShema],
    rating: {
      type: Number,
      required: [true, '`rating` required'],
      default: 0,
    },
    numReviews: {
      type: Number,
      required: [true, '`numReviews` required'],
      default: 0,
    },
    price: {
      type: Number,
      required: [true, '`price` required'],
      default: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: [true, '`countInStock` required'],
      default: 0,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
