const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv').config();
const User = require('../routes/user/model.js');
const Product = require('../routes/product/model.js');
const products = require('../routes/product/initData.json');
const Category = require('../routes/category/model.js');
const connectDB = require('../config/db.js')();

const importData = async () => {
  try {
    await Product.deleteMany();

    const users = await User.find({});
    const adminUsers = users.filter((user) => user.isAdmin);
    const category = await Category.find({});
    const sampleProduct = products.map((product) => {
      const cat = category.filter(
        (item) => item.name.toLowerCase() === product.category.toLowerCase()
      );
      return {
        ...product,
        user: adminUsers[0]._id,
        category: cat.length === 1 ? cat[0]._id : null,
      };
    });
    await Product.insertMany(sampleProduct);
    console.log('Data Imported!'.green.inverse);
    process.exit();
  } catch (importError) {
    console.error(`Error: ${importError}`.red.inverse);
    process.exit(1);
  }
};

// importData();
