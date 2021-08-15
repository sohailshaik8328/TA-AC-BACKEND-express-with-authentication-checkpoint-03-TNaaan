var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    age : {type : String},
    phone : {type : Number},
    country : {type : String},
  },
  { timestamps: true }
);
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
userSchema.methods.fullName = function () {
  return this.firstname + ' ' + this.lastname;
};
userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result);
  });
};


module.exports = mongoose.model('User', userSchema);