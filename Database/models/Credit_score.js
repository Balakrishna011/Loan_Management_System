const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CreditScoreSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    score_value: Number,
    date_checked:{type:Date,default:new Date()}
});
module.exports = mongoose.model("Credit_score", CreditScoreSchema);