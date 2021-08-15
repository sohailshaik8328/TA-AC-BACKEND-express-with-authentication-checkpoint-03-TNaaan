var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expensesSchema = new Schema({
    category : {type : String},
    expenseAmount : {type : Number},
    expenseDate : {type : String},
    // userId : {type : Schema.Types.ObjectId, required : true, ref : "User"}
}, {timestamps : true});



module.exports = mongoose.model('Expense', expensesSchema);