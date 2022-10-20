const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;
const SALT_WORK_FACTOR = 10;

const userSchema = Schema(
  {
    name: {
      type: String,
      validate: {
        validator: function (v) {
          return /^[a-z\s]*$/i.test(v);
        },
        message: (props) => '`name` should be only Text, no Number, no Symbol',
      },
      required: [true, '`name` required'],
      trim: true,
      minLength: [3, '`name` length should at least 3'],
      maxLength: [25, '`name` length should not cross 25'],
    },
    email: {
      type: String,
      required: [true, '`email` required'],
      unique: [true, '`email` should unique'],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, '`password` required'],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    adminedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: 'User',
    },
    adminedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// userSchema.virtual('adminedByName').get(function () {
//   return this.adminedBy !== null ? this.adminedBy.name : 'User not a admin';
// });

userSchema.pre('save', function (next) {
  let user = this;
  if (!user.isModified('password')) {
    next();
  } else {
    bcrypt.genSalt(SALT_WORK_FACTOR, (saltError, calculatedSalt) => {
      if (saltError) return next(saltError);

      bcrypt.hash(user.password, calculatedSalt, (hashError, passwordHash) => {
        if (hashError) return next(hashError);

        user.password = passwordHash;
        next();
      });
    });
  }
});

userSchema.pre('insertMany', async (next, users) => {
  if (Array.isArray(users) && users.length > 0) {
    const hashedUsers = users.map(async (user) => {
      return await new Promise((resolve, reject) => {
        bcrypt
          .genSalt(SALT_WORK_FACTOR)
          .then((salt) => {
            bcrypt
              .hash(user.password.toString(), salt)
              .then((hash) => {
                user.password = hash;
                resolve(user);
              })
              .catch((hashError) => {
                reject(hashError);
              });
          })
          .catch((saltError) => {
            reject(saltError);
          });
      });
    });
    users = await Promise.all(hashedUsers);
    next();
  } else {
    return next(new Error('User list should not be empty')); // lookup early return pattern
  }
});

userSchema.methods = {
  comparePassword: async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  },
};

const User = mongoose.model('User', userSchema);

module.exports = User;
