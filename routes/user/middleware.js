const jwt = require('jsonwebtoken');
const User = require('./model.js');
const { ErrorCustom } = require('../../utils/error');
const asyncHandler = require('express-async-handler');
const { errorMsgRedefined } = require('../../utils/helperFunct.js');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findOne({ _id: decoded.id })
        .select('-password -__v')
        .exec();

      next();
    } catch (error) {
      throw new ErrorCustom('Not authorized, token failed', 401);
    }
  }

  if (!token) {
    throw new ErrorCustom('Not authorized, no token', 401);
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    throw new ErrorCustom('Not authorized as an admin', 401);
  }
};

const adminSelf = async (req, res, userId, field) => {
  if (req.user && req.user.isAdmin) {
    try {
      const user = await User.findOne({ _id: req.user._id });
      const userToEdit = await User.findOne({ _id: userId });
      let userAdminedBy;
      try {
        userAdminedBy = await User.findOne({ _id: userToEdit.adminedBy });
      } catch (error) {
        userAdminedBy = { isAdmin: null };
      }
      const isAdminedBySelf = user._id.toString() === userToEdit._id.toString();

      const isAdminedByUser =
        userToEdit.adminedBy &&
        userToEdit.adminedBy.toString() === user._id.toString();

      const isAdminedByProxy =
        userAdminedBy &&
        userAdminedBy.isAdmin === false &&
        user.isAdmin === true;

      const isAdminEditable =
        (userId && userToEdit.isAdmin === false) ||
        isAdminedBySelf ||
        isAdminedByUser ||
        isAdminedByProxy;

      return isAdminEditable;
    } catch (err) {
      throw new ErrorCustom(errorMsgRedefined(err), 400);
    }
  } else {
    throw new ErrorCustom('Not authorized as an admin', 401);
  }
};

module.exports = { protect, admin, adminSelf };
