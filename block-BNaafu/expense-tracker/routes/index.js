var express = require('express');
var router = express.Router();
var passport = require('passport');
var auth = require('../middleware/auth');
var User = require('../models/User');
var Expense = require('../models/expenseModel');
var Income = require('../models/incomeModel');
var moment = require('moment');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/success', auth.isLoggedIn, function (req, res, next) {
  var id = req.session.userId || req.session.passport.user;
  var allCategories = [];
  let date = new Date();
  let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  console.log('new date', firstDay, lastDay);
  var addIncome = 0;
  var addExpense = 0;
  Income.find(
    {
      incomeDate: {
        $gte: firstDay,
        $lte: lastDay,
      },
      userId: id,
    },
    (err, income) => {
      var newIncomeDate = moment(income.incomeDate).format(
        'dddd, MMMM Do YYYY'
      );
      for (var i = 0; i < income.length; i++) {
        addIncome += income[i].incomeAmount;
      }
      income.filter((event) => {
        var some = event.source.split(',');
        for (var i = 0; i < some.length; i++) {
          if (!allCategories.includes(some[i])) {
            allCategories.push(some[i]);
          }
        }
      });
      Expense.find(
        {
          expenseDate: {
            $gte: firstDay,
            $lte: lastDay,
          },
          userId: id,
        },
        (err, expense) => {
          var newExpenseDate = moment(expense.expenseDate).format(
            'dddd, MMMM Do YYYY'
          );
          for (var i = 0; i < expense.length; i++) {
            addExpense += expense[i].expenseAmount;
          }
          expense.filter((event) => {
            var some = event.category.split(',');
            for (var i = 0; i < some.length; i++) {
              if (!allCategories.includes(some[i])) {
                allCategories.push(some[i]);
              }
            }
          });
          var totalSavings = addIncome - addExpense;
          res.render('secondSuccess', {
            allCategories,
            income,
            expense,
            addExpense,
            addIncome,
            totalSavings,
            newExpenseDate,
            newIncomeDate,
          });
        }
      );
    }
  );
});
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    var user = req.user;
    // Successful authentication, redirect home.
    res.redirect('/success');
  }
);

router.get('/auth/github', passport.authenticate('github'));

router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    var user = req.user;
    // Successful authentication, redirect home.
    res.redirect('/success');
  }
);
router.get('/logout', function (req, res) {
  console.log(req.session);
  console.log('cookie', 'connect.sid');
  req.session.destroy(function (e) {
    req.logOut();
    console.log(req.session);
  });
  res.clearCookie('connect.sid');
  res.redirect('/');
});
module.exports = router;
