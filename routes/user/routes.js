const express = require('express');
const router = express.Router();

const {
  authUser,
  registerUser,
  getUserProfile,
  getUserById,
  getUsers,
  updateUserProfile,
  updateUser,
  deleteUser,
} = require('./controller.js');

const { protect, admin } = require('./middleware.js');

router.route('/').post(registerUser).get(protect, admin, getUsers);
router.post('/login', authUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router
  .route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
