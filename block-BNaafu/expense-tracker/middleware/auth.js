var User = require('../models/User');
module.exports = {
  isLoggedIn: (req, res, next) => {
    if (
      !(
        (req.session.passport && req.session.passport.user) ||
        req.session.userId
      )
    ) {
      return res.redirect('/users/register');
    }
    if (req.session.userId || req.session.passport.user) {
      return next();
    } else {
      res.status(401).send('Not Logged In');
    }
  },
  isNotVerified: (err, req, res, next) => {
    User.findOne({ username: req.body.username }, (err, user) => {
      console.log(user.isVerified);
      if (user.isVerified) {
        return next();
      } else {
        res.status(401).send('Not Verified');
      }
    });
  },
  userInfoIfLogged: (req, res, next) => {
    var userId = req.session || req.session.userId || req.session.passport.user;
    if (userId) {
      // grab more user info from database
      User.findById(userId, (err, user) => {
        // handle error error
        req.user = user;
        res.locals.user = user;
        return next();
      });
    } else {
      req.user = null;
      res.locals.user = null;
      return next();
    }
  },
};
