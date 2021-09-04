var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var incomeSchema = new Schema(
  {
    source: { type: String },
    incomeAmount: { type: Number },
    incomeDate: { type: Date },
    userEmail: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Income', incomeSchema);
