var express = require('express');
var router = express.Router();
var passport = require('passport');
const isLoggedIn = require('../middleware/auth');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/success', (req, res) => {
  res.render('success');
});
router.get('/failure', (req, res) => {
  res.render('failure');
});

router.get(
  '/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);
router.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/failure',
  }),
  (req, res) => {
    res.redirect('/success');
  }
);
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/failure' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/success');
  }
);
router.get('/logout', isLoggedIn, function (req, res) {
  console.log(req.session);
  req.session.destroy(function (e) {
    req.logout();
    console.log(req.session);
  });
  res.clearCookie('connect.sid');
  res.redirect('/');
});
module.exports = router;