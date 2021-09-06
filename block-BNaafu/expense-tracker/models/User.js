var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var passportLocalMongoose = require('passport-local-mongoose');
var userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    github: {
      name: String,
      username: String,
      image: String,
    },
    google: {
      name: String,
      username: String,
      image: String,
    },
    username: { type: String },
    password: { type: String },
    isVerified: { type: Boolean },
    emailToken: { type: String },
    random: { type: Number },
    providers: [String],
    expenseId: [{ type: Schema.Types.ObjectId, ref: 'Expense' }],
    incomeId: [{ type: Schema.Types.ObjectId, ref: 'Income' }],
  },
  { timestamps: true }
);
userSchema.plugin(passportLocalMongoose);

userSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) return next(err);
      this.password = hashed;
      return next();
    });
  } else {
    next();
  }
});

userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result);
  });
};
module.exports = mongoose.model('User', userSchema);
