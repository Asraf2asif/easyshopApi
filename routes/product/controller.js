const asyncHandler = require('express-async-handler');
const Product = require('./model.js');
const User = require('../user/model.js');
const Category = require('../category/model.js');
const { ErrorCustom } = require('../../utils/error.js');
const {
  emptyError,
  errorMsgRedefined,
  updateByInput,
} = require('../../utils/helperFunct.js');
const { getQuerys } = require('../../utils/getQuerys.js');

const getProducts = asyncHandler(async (req, res) => {
  const {
    query: { keyword, key: keyName, sort = 'name', pageNumber },
  } = req;
  const pageSize = 12;
  const page = Number(pageNumber) || 1;

  let query = await getQuerys(keyword, keyName, {
    category: Category,
    user: User,
  });
  // console.log(query['$and']);
  const products = await Product.find({ ...query })
    .populate('user', '_id name')
    .populate({
      path: 'category',
      // Get friends of friends - populate the 'friends' array for every friend
      populate: { path: 'parent', select: 'name -_id' },
    })
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  const count = await Product.countDocuments({ ...query });

  res.json({ products, page, pages: Math.ceil(count / pageSize), count });
});

const productById = async (id) => {
  const errHandle = (error) => {
    console.log(error);
    throw new ErrorCustom(`Product id: "${id}" is not found`, 404);
  };

  try {
    const product = await Product.findOne({ _id: id }).populate({
      path: 'category',
      // Get friends of friends - populate the 'friends' array for every friend
      populate: { path: 'parent', select: 'name -_id' },
    });
    if (product) {
      return product;
    } else {
      errHandle();
    }
  } catch (error) {
    errHandle(error);
  }
};

const getProductById = asyncHandler(async (req, res) => {
  const product = await productById(req.params.id);
  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productById(req.params.id);

  if (product) {
    await product.remove();
    res.json({ message: 'Product removed' });
  } else {
    throw new ErrorCustom(errorMsgRedefined(err), 400);
  }
});

const createProduct = asyncHandler(async (req, res) => {
  emptyError(req.body);

  try {
    const product = new Product({
      ...req.body,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (err) {
    throw new ErrorCustom(errorMsgRedefined(err), 400);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productById(req.params.id);

  try {
    updateByInput(req.body, product);
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    throw new ErrorCustom(errorMsgRedefined(err), 400);
  }
});

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await productById(req.params.id);

  try {
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      throw new ErrorCustom('Product already reviewed', 400);
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    const totalRating = product.reviews.reduce(
      (acc, item) => item.rating + acc,
      0
    );
    product.rating = totalRating / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    throw new ErrorCustom(errorMsgRedefined(err), 400);
  }
});

const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(5);
  res.json(products);
});

const getNavCategory = asyncHandler(async (req, res) => {
  const ProductCat = await Product.find({})
    .select('category -_id')
    .populate({
      path: 'category',
      select: 'parent -_id',
      populate: { path: 'parent' },
    });
  const unique = [
    ...new Set(ProductCat.map((element) => element.category.parent.name)),
  ];
  let categories = await Category.find({
    name: { $in: unique },
    isNav: true,
  }).sort('navIndex');

  categories = await Promise.all(
    categories.map(async (cat) => {
      const child = await Category.find({
        parent: cat._id,
      }).distinct('name');
      return { ...cat.toObject(), child: child };
    })
  );

  res.json(categories);
});

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts,
  getNavCategory,
};
