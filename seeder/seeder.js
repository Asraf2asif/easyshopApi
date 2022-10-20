const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv').config();
const User = require('../routes/user/model.js');
const users = require('../routes/user/initData.json');
const Product = require('../routes/product/model.js');
const products = require('../routes/product/initData.json');
const Order = require('../routes/order/model.js');
const connectDB = require('../config/db.js')();

const deleteData = async () => {
  await User.deleteMany();
  await Product.deleteMany();
  await Order.deleteMany();

  console.log('Database Reset Complete!'.red.inverse);
};

const importData = async () => {
  try {
    await deleteData();

    const createdUsers = await User.insertMany(users);
    const adminUsers = createdUsers.filter((user) => user.isAdmin);
    const sampleProduct = products.map((product) => {
      return {
        ...product,
        user: adminUsers[0]._id,
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

const destroyData = async () => {
  try {
    await deleteData();
    process.exit();
  } catch (deleteError) {
    console.error(`Error: ${deleteError}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  // destroyData();
} else {
  // importData();
}
