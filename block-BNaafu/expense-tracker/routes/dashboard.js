var express = require('express');
var router = express.Router();
var Income = require('../models/incomeModel');
var Expense = require('../models/expenseModel');
var User = require('../models/User');
var moment = require('moment');
router.post('/income', (req, res, next) => {
  var id = req.session.userId || req.session.passport.user;
  req.body.userId = id;
  Income.create(req.body, (err, income) => {
    if (err) return next(err);
    User.findByIdAndUpdate(
      id,
      { $push: { incomeId: income.id } },
      { new: true },
      (err, updatedIncome) => {
        if (err) return next(err);
        res.redirect('/success');
      }
    );
  });
});

router.post('/expense', (req, res, next) => {
  var id = req.session.userId || req.session.passport.user;
  req.body.userId = id;
  Expense.create(req.body, (err, expense) => {
    console.log(expense);
    if (err) return next(err);
    User.findByIdAndUpdate(
      id,
      { $push: { expenseId: expense.id } },
      { new: true },
      (err, updatedExpense) => {
        if (err) return next(err);
        res.redirect('/success');
      }
    );
  });
});
router.post('/date', (req, res, next) => {
  var id = req.session.userId || req.session.passport.user;
  let expense = [];
  let income = [];
  let year = req.body.month.split('-')[0];
  let month = req.body.month.split('-')[1];
  let date = year + '-' + month + '-' + '01';
  let firstDay = new Date(
    new Date(date).getFullYear(),
    new Date(date).getMonth(),
    1
  );
  let lastDay = new Date(
    new Date(date).getFullYear(),
    new Date(date).getMonth() + 1
  );
  var allCategories = [];
  console.log('something', firstDay, lastDay);
  Income.find({ userId: id }, (err, events) => {
    events.filter((event) => {
      // console.log(event);
      var some = event.source.split(',');
      for (var i = 0; i < some.length; i++) {
        if (!allCategories.includes(some[i])) {
          allCategories.push(some[i]);
        }
      }
    });
  });
  Expense.find({ userId: id }, (err, events) => {
    events.filter((event) => {
      // console.log(event);
      var some = event.category.split(',');
      for (var i = 0; i < some.length; i++) {
        if (!allCategories.includes(some[i])) {
          allCategories.push(some[i]);
        }
      }
    });
  });
  Income.find(
    {
      incomeDate: {
        $gt: firstDay,
        $lte: lastDay,
      },
      userId: id,
    },
    (err, income) => {
      var newIncomeDate = moment(income.incomeDate).format(
        'dddd, MMMM Do YYYY'
      );
      Expense.find(
        {
          expenseDate: {
            $gt: firstDay,
            $lte: lastDay,
          },
          userId: id,
        },
        (err, expense) => {
          var newExpenseDate = moment(expense.expenseDate).format(
            'dddd, MMMM Do YYYY'
          );
          console.log(income, expense);
          if (err) return next(err);
          let addExpense = expense.reduce(
            (acc, curr) => acc + Number(curr.expenseAmount),
            0
          );
          let addIncome = income.reduce(
            (acc, curr) => acc + Number(curr.incomeAmount),
            0
          );
          let totalSavings = addIncome - addExpense;
          res.render('secondSuccess', {
            income,
            expense,
            addIncome,
            addExpense,
            totalSavings,
            allCategories: allCategories,
            newIncomeDate,
            newExpenseDate,
          });
        }
      );
    }
  );
});

module.exports = router;
