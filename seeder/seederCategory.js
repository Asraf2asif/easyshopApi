const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv').config();
const User = require('../routes/user/model.js');
const Category = require('../routes/category/model.js');
const categories = require('../routes/category/initData.json');
const connectDB = require('../config/db.js')();

const navCat = [
  'Grocery',
  'Mobiles',
  'Fashion',
  'Electronics',
  'Home',
  'Appliances',
  'Travel',
  'Beauty',
  'Toys',
];

const importData = async () => {
  try {
    await Category.deleteMany();

    const users = await User.find({});
    const adminUsers = users.filter((user) => user.isAdmin);
    const sampleNavCategory = navCat.map((category, idx) => {
      return {
        name: category,
        user: adminUsers[0]._id,
        isNav: true,
        navIndex: idx + 1,
      };
    });
    await Category.insertMany(sampleNavCategory);
    const category = await Category.find({});
    const sampleCategory = categories.map((cat) => {
      const parentCat = category.filter(
        (item) => item.name.toLowerCase() === cat.parent.toLowerCase()
      );
      return {
        ...cat,
        user: adminUsers[0]._id,
        parent: parentCat.length === 1 ? parentCat[0]._id : null,
      };
    });

    await Category.insertMany(sampleCategory);
    console.log('Data Imported!'.green.inverse);
    process.exit();
  } catch (importError) {
    console.error(`Error: ${importError}`.red.inverse);
    process.exit(1);
  }
};

// importData();
