var express = require('express');
var passport = require('passport');
var flash = require('connect-flash');
var crypto = require('crypto');
const nodemailer = require('nodemailer');
var router = express.Router();
var User = require('../models/User');
var mg = require('nodemailer-mailgun-transport');
var bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/register', function (req, res, next) {
  res.render('register');
});

router.post('/register', async (req, res) => {
  var user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    emailToken: crypto.randomBytes(64).toString('hex'),
    isVerified: false,
  });

  User.register(user, req.body.password, async function (err, user) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/users/register');
    } else if (user) {
      var auth = {
        auth: {
          api_key: process.env.API_KEY,
          domain: process.env.DOMAIN,
        },
      };

      var nodemailerMailgun = nodemailer.createTransport(mg(auth));

      nodemailerMailgun.sendMail(
        {
          from: 'myemail@example.com',
          to: req.body.email,
          subject: 'verification link',
          text: `Hello user , thanks for registering  on our site , please click the link below
          http://${req.headers.host}/users/verify-email?token=${user.emailToken}`,
        },
        function (err, info) {
          if (err) {
            console.log('Error: ' + err);
            console.log(req.flash('error', err));
            return res.redirect('/');
          } else {
            console.log('email Sent');
            return res.send('verification link sent to your mail');
          }
        }
      );
    }
  });
});

router.get('/verify-email', async (req, res, next) => {
  console.log(req.session);
  try {
    const user = await User.findOne({ emailToken: req.query.token });
    if (!user) {
      req.flash('error', 'token is invalid');
      return res.redirect('/');
    }
    user.emailToken = null;
    user.isVerified = true;
    await user.save();
    await req.login(user, async (err) => {
      if (err) return next(err);
      req.flash('success', `Welcome to the website ${user.username}`);

      res.redirect('/');
    });
  } catch (error) {
    console.log(error);
    req.flash(
      'error',
      `somethiong went wrong. please contact us for assistance`
    );
    res.redirect('/');
  }
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

// router.post('/login', function (req, res, next) {
//   passport.authenticate('local', function (err, user, info) {
//     console.log('mmmmmmmm', user);
//     if (user) {
//       return res.redirect(`/success`);
//     }
//     return res.redirect('/users/login');
//   })(req, res, next);
// });
// router.post(
//   '/login',
//   passport.authenticate('local', { failureRedirect: '/login' }),
//   function (req, res) {
//     res.redirect('/');
//   }
// );
//normal login
router.post('/login', (req, res, next) => {
  var { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    return res.redirect('/users/login');
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.redirect('/users/login');
    }
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      console.log(result);
      if (!result) {
        console.log(password);
        return res.redirect('/users/login');
      }
      req.session.userId = user.id;
      res.redirect('/success');
    });
  });
});

//render forgot password page
router.get('/login/forgotpassword', (req, res, next) => {
  console.log('get', req.session.user);
  let error = req.flash('error')[0];
  let info = req.flash('info')[0];
  res.render('forgotPassword', { error, info });
});
function random() {
  return Math.floor(100000 + Math.random() * 900000);
}
//process forgot password
router.post('/login/forgotpassword', (req, res, next) => {
  console.log('post', req.session.user);
  var { email } = req.body;
  console.log('WWWWWWWWW', email);
  req.body.random = random();
  console.log(req.body.random);
  User.findOneAndUpdate({ email }, req.body, (err, user) => {
    if (err) return next(err);
    var userId = user._id;
    if (!user) {
      req.flash(
        'error',
        'The Email entered is not Registered, Please entered the registered Email'
      );
      return res.redirect('/users/login/forgotpassword');
    }
    var auth = {
      auth: {
        api_key: process.env.API_KEY,
        domain: process.env.DOMAIN,
      },
    };

    var nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail(
      {
        from: 'myemail@example.com',
        to: req.body.email,
        subject: 'password change',
        html: `<h1>${req.body.random}</h1>
       <h2>Please Copy above 6 digit number and click this link http://localhost:3000/users/login/resetpassword/verify/${userId} </h2>`,
      },
      function (err, info) {
        if (err) {
          console.log('Error: ' + err);
          return res.redirect('/');
        } else {
          console.log('email Sent');
          return res.redirect('/users/login/forgotpassword');
        }
      }
    );
  });
});

//render reset password verification code page
router.get('/login/resetpassword/verify/:id', (req, res, next) => {
  var id = req.params.id;

  let error = req.flash('error')[0];

  res.render('resetPasswordVerificationCode', { error, id });
});

//process verification code
router.post('/login/resetpassword/verify', (req, res, next) => {
  let { userId, passcode } = req.body;
  console.log(userId);
  var id = userId;
  console.log('post', id);
  req.session.id = id;
  console.log(req.session);
  User.findOne({ _id: id }, (err, user) => {
    if (err) return next(err);
    if (passcode == user.random) {
      return res.redirect(`/users/login/resetpassword/${id}`);
    } else {
      req.flash('error', 'Enter the correct verification code');
      res.redirect('/users/login');
    }
  });
});

//render reset password page
router.get('/login/resetpassword/:id', (req, res, next) => {
  let id = req.params.id;
  let error = req.flash('error')[0];
  res.render('resetPassword', { error, id });
});

//reset password
router.post('/login/resetpassword', (req, res, next) => {
  let { id, newPasswd1, newPasswd2 } = req.body;
  console.log(id, newPasswd1, newPasswd2);
  if (newPasswd1 === newPasswd2) {
    User.findOne({ _id: id }, (err, user) => {
      console.log(user);
      if (err) return next(user);
      bcrypt.hash(newPasswd1, 10, (err, hashed) => {
        if (err) return next(err);
        req.body.password = hashed;
        User.findOneAndUpdate({ _id: id }, req.body, (err, user) => {
          if (err) return next(err);
          console.log('info', 'Password is Successfully Changed');
          return res.redirect('/users/login');
        });
      });
    });
  } else {
    console.log('error', 'Password does not match');
    req.flash('error', 'Password does not match');
    res.redirect('/users/login/resetpassword');
  }
});

module.exports = router;
