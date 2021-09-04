var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Income = require('../models/incomeModel');
var Expense = require('../models/expenseModel');
var parse = require('url-parse');
var moment = require('moment');
router.get('/', function (req, res, next) {
  var id = req.session.userId || req.session.passport.user;
  var body = req.body;
  var url = parse(req.url, true);
  var category = url.query.name;
  var allCategories = [];
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
  Income.find({ userId: id, source: category }, (err, income) => {
    var newIncomeDate = moment(income.incomeDate).format('dddd, MMMM Do YYYY');
    Expense.find({ userId: id, category: category }, (err, expense) => {
      var newExpenseDate = moment(expense.expenseDate).format(
        'dddd, MMMM Do YYYY'
      );
      res.render('success', {
        income,
        expense,
        allCategories,
        newIncomeDate,
        newExpenseDate,
      });
    });
  });
});
router.post('/dateSort', function (req, res, next) {
  var id = req.session.userId || req.session.passport.user;
  var body = req.body;
  var allCategories = [];
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
        $gte: body.start_date,
        $lte: body.end_date,
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
            $gte: body.start_date,
            $lt: body.end_date,
          },
          userId: id,
        },
        (err, expense) => {
          var newExpenseDate = moment(expense.expenseDate).format(
            'dddd, MMMM Do YYYY'
          );
          res.render('success', {
            income,
            expense,
            allCategories: allCategories,
            newExpenseDate,
            newIncomeDate,
          });
        }
      );
    }
  );
});
router.post('/bothSort', function (req, res, next) {
  var id = req.session.userId || req.session.passport.user;
  var body = req.body;
  var categoryName = body.category;

  var allCategories = [];

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
        $gte: body.start_date,
        $lte: body.end_date,
      },
      source: categoryName,
      userId: id,
    },
    (err, income) => {
      var newIncomeDate = moment(income.incomeDate).format(
        'dddd, MMMM Do YYYY'
      );
      Expense.find(
        {
          expenseDate: {
            $gte: body.start_date,
            $lte: body.end_date,
          },
          category: categoryName,
          userId: id,
        },
        (err, expense) => {
          var newExpenseDate = moment(expense.expenseDate).format(
            'dddd, MMMM Do YYYY'
          );
          res.render('success', {
            income,
            expense,
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
