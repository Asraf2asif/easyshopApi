const mongoose = require('mongoose');
const { ErrorCustom } = require('./error.js');

const {
  isEmpty,
  isNumber,
  isObjectId,
  isDateStr,
  strToDate,
} = require('./helperFunct.js');

const isDateRange = (str) => {
  return str && str.split('|').length >= 2;
};

const getDateRange = (dtStr1, dtStr2, keyLogic = null) => {
  let emptyDt = [];
  let invalidDt = [];
  let errMsg = [];
  if (!dtStr1 || isEmpty(dtStr1)) {
    emptyDt.push('from date requred');
  } else if (!isDateStr(dtStr1)) {
    invalidDt.push(dtStr2);
  }

  if (!dtStr2 || isEmpty(dtStr2)) {
    emptyDt.push('to date requred');
  } else if (!isDateStr(dtStr2)) {
    invalidDt.push(dtStr2);
  }

  if (emptyDt.length > 0) {
    errMsg.push(`${emptyDt.join(', ')}`);
  }

  if (invalidDt.length > 0) {
    invalidDt.push(`Invalid Date: ${invalidDt.join(', ')}`);
  }

  if (errMsg.length > 0) {
    throw new ErrorCustom(errMsg.join('\n'), 400);
  }

  let timeDt1 = 'resetTime';
  let timeDt2 = 'maxTime';
  if (keyLogic && !isEmpty(keyLogic)) {
    switch (keyLogic) {
      case 'gt':
        timeDt1 = 'maxTime';
        break;
      case 'lt':
        timeDt2 = 'resetTime';
        break;
      default:
        break;
    }
  }
  return [strToDate(dtStr1, timeDt1), strToDate(dtStr2, timeDt2)];
};

const getQueryVal = (keyWord) => {
  let dateRange = null,
    queryVal,
    keyLogic,
    keyWordClean;

  const {
    Types: { ObjectId },
  } = mongoose;

  const keyWordSplited = keyWord.split('<,>');
  if (keyWordSplited.length >= 2) {
    keyLogic = keyWordSplited[0];
    keyWordClean = keyWordSplited.slice(1).join();
  } else {
    keyLogic = null;
    keyWordClean = keyWordSplited[0];
  }

  if (isNumber(keyWordClean)) {
    keyWordClean = Number(keyWordClean);
  } else if (isObjectId(keyWordClean)) {
    keyWordClean = ObjectId(keyWordClean);
    return keyWordClean;
  } else if (isDateStr(keyWordClean)) {
    dateRange = getDateRange(keyWordClean, keyWordClean, keyLogic);
  } else if (isDateRange(keyWordClean)) {
    const [dtStr1, dtStr2] = keyWordClean.split('<|>');
    dateRange = getDateRange(dtStr1, dtStr2);
  }

  if (keyLogic && !isEmpty(keyLogic)) {
    switch (keyLogic) {
      case 'eq':
        queryVal = dateRange
          ? {
              $gte: dateRange[0],
              $lte: dateRange[1],
            }
          : keyWordClean;
        break;
      case 'gte':
        queryVal = {
          $gte: dateRange ? dateRange[0] : keyWordClean,
        };
        break;
      case 'gt':
        queryVal = {
          $gt: dateRange ? dateRange[0] : keyWordClean,
        };
        break;
      case 'lte':
        queryVal = {
          $lte: dateRange ? dateRange[1] : keyWordClean,
        };
        break;
      case 'lt':
        queryVal = {
          $lt: dateRange ? dateRange[1] : keyWordClean,
        };
        break;
      default:
        break;
    }
  } else {
    queryVal = {
      $regex: keyWordClean,
      $options: 'i',
    };
  }
  return queryVal;
};

const getQuery = async (keyWord, keyName, refModels = {}) => {
  let query;
  if (keyWord && keyWord !== '' && keyName && keyName !== '') {
    let queryVal = getQueryVal(keyWord);

    const [field, ...subField] = keyName.split('<.>');

    if (
      subField &&
      subField.length > 0 &&
      Object.keys(refModels).indexOf(field) !== -1
    ) {
      let refData = [];
      if (subField.length >= 2) {
        let populatedRefModel = await refModels[field]
          .find({})
          .select('_id')
          .populate(subField[0], subField[1]);
        queryVal = typeof queryVal === 'object' ? queryVal['$regex'] : queryVal;

        populatedRefModel.forEach((cat) => {
          if (
            cat[subField[0]] !== null &&
            new RegExp(queryVal, 'i').test(cat[subField[0]][subField[1]])
          ) {
            refData.push(cat._id.toString());
          }
        });
      } else {
        try {
          refData = await refModels[field].find({
            [subField.join('.')]: queryVal,
          });
        } catch (error) {
          try {
            refData = await refModels[field].find({
              [subField.join('.')]: queryVal['$regex'],
            });
          } catch (error) {
            console.log(error);
          }
        }
      }

      if (refData.length === 1) {
        query = {
          [`${field}`]: {
            _id:
              typeof refData[0] === 'object'
                ? refData[0]._id.toString()
                : refData.toString(),
          },
        };
      } else if (refData.length > 1) {
        query = {
          [`${field}`]: { $in: refData },
        };
      } else {
        query = {};
      }
    } else {
      query = {
        [`${keyName.replace(/<.>/g, '.')}`]: queryVal,
      };
    }
  } else {
    query = {};
  }
  return query;
};

const getQuerys = async (keyWords='', keyNames='', refModels = {}) => {
  var querys = { $and: [] };
  const keyWordSplited = keyWords.split('<~>');
  const keyNameSplited = keyNames.split('<~>');

  querys[`$and`] = await Promise.all(
    keyWordSplited.map(async function (keyWord, idx) {
      return await getQuery(keyWord, keyNameSplited[idx], refModels);
    })
  );
  return querys;
};

module.exports = {
  getQuerys,
};
