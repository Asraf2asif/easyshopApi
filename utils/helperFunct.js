const mongoose = require('mongoose');
const { ErrorCustom } = require('./error.js');

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const excludeKey = (obj, keysToExclude) => {
  const filteredObj = Object.entries(obj).filter(
    (key, _) => keysToExclude.indexOf(key) === -1
  );
  return Object.fromEntries(filteredObj);
};

const errorMsg = (error) =>
  error.response && error.response.data.message
    ? error.response.data.message
    : error.message;

const errorMsgRedefined = (error) => {
  const errMsgArr = errorMsg(error).split(':');

  const errMsgSliced =
    errMsgArr.length === 1
      ? errMsgArr // errMsg Full (on errMsgArr.length = 1)
      : errMsgArr.length === 2
      ? errMsgArr.slice(1) // errMsg Partial (on errMsgArr.length = 2)
      : errMsgArr.slice(2); // errMsg Partial (on errMsgArr.length more than 2)

  return errMsgSliced.join();
};

const isNumber = (str) => {
  return !isNaN(str);
};

const isEmpty = (elem) =>
  (elem && elem.toString().trim() === '') ||
  (isNumber(elem) && Number(elem) === 0) ||
  elem === null ||
  elem === 'undefined' ||
  elem === undefined;

const emptyError = (input, keysToExclude = []) => {
  const emptyInput = [];
  const keys = Object.keys(input);

  keys.forEach((key) => {
    if (isEmpty(input[key]) && keysToExclude.indexOf(key) === -1) {
      emptyInput.push(capitalize(key));
    }
  });

  if (emptyInput.length > 0) {
    throw new ErrorCustom(`${emptyInput.join(', ')} required`, 400);
  }
};

const updateByInput = (input, elem, keysToExclude = []) => {
  const errMsg = [];
  const keys = Object.keys(input);

  keys.forEach((key) => {
    if (keysToExclude.indexOf(key) !== -1) {
      errMsg.push(`Not authorised to edit '${key}'`);
    } else if (isEmpty(input[key])) {
      errMsg.push(`Empty or invalid '${key}'`);
    } else if (elem[key] === input[key]) {
      errMsg.push(`New '${key}' and Old '${key}' are same`);
    } else {
      elem[key] = input[key];
    }
  });

  if (errMsg.length > 0) {
    throw new ErrorCustom(`${errMsg.join(', ')}`, 400);
  }
};

const isObjectId = (str) => {
  const {
    Types: { ObjectId },
  } = mongoose;
  return ObjectId.isValid(str) === true;
};

const isDateStr = (str) => {
  return new Date(str) !== 'Invalid Date' && !isNaN(new Date(str));
};

const resetTime = (date) => {
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

const setMaxTime = (date) => {
  date.setHours(23);
  date.setMinutes(59);
  date.setSeconds(59);
  date.setMilliseconds(59);
  return date;
};

const strToDate = (str, time = null) => {
  var date = new Date(str);
  if (time && !isEmpty(time)) {
    switch (time) {
      case 'resetTime':
        resetTime(date);
        break;
      case 'maxTime':
        setMaxTime(date);
        break;
      default:
        break;
    }
  }
  date.setHours(date.getHours() - date.getTimezoneOffset() / 60);
  return date.toISOString();
};

module.exports = {
  capitalize,
  excludeKey,
  errorMsg,
  errorMsgRedefined,
  emptyError,
  updateByInput,
  isEmpty,
  isNumber,
  isObjectId,
  isDateStr,
  strToDate,
};
