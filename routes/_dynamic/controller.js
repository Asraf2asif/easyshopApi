const asyncHandler = require('express-async-handler');
const { ErrorCustom } = require('../../utils/error.js');
const { errorMsgRedefined } = require('../../utils/helperFunct.js');
const Category = require('../category/model.js');
const Order = require('../order/model.js');
const Product = require('../product/model.js');
const User = require('../user/model.js');
// const { ErrorCustom } = require('../../utils/error.js');

const dbList = {
  category: Category,
  order: Order,
  product: Product,
  user: User,
};

const getFieldList = asyncHandler(async (req, res) => {
  const {
    query: { dbName, field },
  } = req;

  try {
    const fieldArr = field.split('.');

    if (fieldArr.length === 1 || /<.>/.test(field)) {
      const cleanedField = field.replace('<.>', '.');
      const list = await dbList[dbName]
        .find({})
        .select(`${cleanedField} -_id`)
        .distinct(cleanedField);

      res.json(list);
    } else if (fieldArr.length === 2) {
      const list = await dbList[dbName]
        .find({})
        .populate(fieldArr[0])
        .populate({
          path: fieldArr[0],
          select: `${fieldArr[1]} -_id`,
        })
        .select(`${fieldArr[0]} -_id`);

      const distinct = [];

      for (let i = 0; i < list.length; i++) {
        let value = null;
        try {
          value = list[i][fieldArr[0]][fieldArr[1]] || null;
        } catch {
          value = null;
        }

        if (value && distinct.indexOf(value) === -1) {
          distinct.push(value);
        }
      }
      res.json(distinct);
    } else if (fieldArr.length === 3) {
      const list = await dbList[dbName]
        .find({})
        .populate(fieldArr[0])
        .populate({
          path: fieldArr[0],
          select: `${fieldArr[1]} -_id`,
          populate: { path: fieldArr[1], select: `${fieldArr[2]} -_id` },
        })
        .select(`${fieldArr[0]} -_id`);

      const distinct = [];

      for (let i = 0; i < list.length; i++) {
        let value = null;
        try {
          value = list[i][fieldArr[0]][fieldArr[1]][fieldArr[2]] || null;
        } catch {
          value = null;
        }

        if (value && distinct.indexOf(value) === -1) {
          distinct.push(value);
        }
      }
      res.json(distinct);
    }
  } catch (err) {
    console.log(err);
    throw new ErrorCustom(errorMsgRedefined(err), 400);
  }
});

module.exports = {
  getFieldList,
};
