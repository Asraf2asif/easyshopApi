const asyncHandler = require('express-async-handler');
const User = require('./model.js');
const generateWebToken = require('../../utils/generateToken.js');
const { ErrorCustom } = require('../../utils/error.js');
const {
  excludeKey,
  errorMsgRedefined,
  emptyError,
  updateByInput,
} = require('../../utils/helperFunct.js');
const { getQuerys } = require('../../utils/getQuerys.js');
const { adminSelf } = require('./middleware.js');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  emptyError(req.body);

  const userExists = await User.findOne({ email });

  if (!userExists) {
    try {
      const user = await User.create({
        name,
        email,
        password,
      });

      const excludedUser = excludeKey(user.toObject(), ['password', '__v']);

      const userObj = {
        ...excludedUser,
        token: generateWebToken(user._id),
      };

      res.status(201).json(userObj);
    } catch (err) {
      throw new ErrorCustom(errorMsgRedefined(err), 400);
    }
  } else {
    throw new ErrorCustom('User already exists', 400);
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  let userObj, user;

  // Check empty input
  emptyError(req.body);

  // Check for valid user
  try {
    user = await User.findOne({ email }).select('-__v');
    userObj = {
      ...user.toObject(),
      token: generateWebToken(user._id),
    };
  } catch (error) {
    throw new ErrorCustom('Email address not found', 404);
  }

  // Check for valid password
  const passwordValid = await user.comparePassword(password);
  if (passwordValid) {
    res.json(userObj); // response return
  } else {
    throw new ErrorCustom('Password not match', 404);
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    throw new ErrorCustom('User not found', 404);
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  if (req.user) {
    try {
      const user = await User.findOne({ _id: req.user._id });
      // update and save user
      updateByInput(req.body, user, ['isAdmin']);
      const updatedUser = await user.save();

      const excludedUser = excludeKey(updatedUser.toObject(), [
        'password',
        '__v',
      ]);

      res.json(excludedUser);
    } catch (err) {
      throw new ErrorCustom(errorMsgRedefined(err), 400);
    }
  } else {
    throw new ErrorCustom('User not found', 404);
  }
});

// for admin
const updateUser = asyncHandler(async (req, res) => {
  try {
    if (await adminSelf(req, res, req.params.id) === true) {
      const userToEdit = await User.findOne({ _id: req.params.id });
      userToEdit.isAdmin = req.body.isAdmin;
      userToEdit.adminedBy = req.body.isAdmin === true ? req.user._id : null;
      userToEdit.adminedAt = req.body.isAdmin === true ? new Date() : null;
      const updatedUser = await userToEdit.save();

      const excludedUser = excludeKey(updatedUser.toObject(), [
        'password',
        '__v',
      ]);

      res.json(excludedUser);
    } else {
      throw new ErrorCustom("Can't edit other admin's profile", 400);
    }
  } catch (err) {
    console.log(err)
    throw new ErrorCustom(errorMsgRedefined(err), 400);
  }
});

// for admin
const getUsers = asyncHandler(async (req, res) => {
  const {
    query: { keyword, key: keyName, sort = '-createdAt', pageNumber },
  } = req;
  let query = await getQuerys(keyword, keyName, { adminedBy: User });
  // console.log(query['$and']);
  // console.log(sort);
  const pageSize = 5;
  const page = Number(pageNumber) || 1;

  const users = await User.find({ ...query })
    .populate('adminedBy', '_id name')
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  const count = await User.countDocuments({ ...query });

  res.json({ users, page, pages: Math.ceil(count / pageSize) });
});

// for admin
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (user) {
      await user.remove();
      res.json({ message: 'User removed' });
    } else {
      throw new ErrorCustom('User not found', 404);
    }
  } catch (err) {
    throw new ErrorCustom('User not found', 404);
  }
});

// for admin
const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select('-password');

    if (user) {
      res.json(user);
    } else {
      throw new ErrorCustom('User not found', 404);
    }
  } catch (err) {
    throw new ErrorCustom('User not found', 404);
  }
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
