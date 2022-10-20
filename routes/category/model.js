const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
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
      unique: [true, '`name` should unique'],
    },
    isNav: {
      type: Boolean,
      required: [true, '`isNav` required'],
      default: false,
    },
    navIndex: {
      type: Number,
      required: [true, '`navIndex` required'],
      default: 0,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'Category',
    },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
