const mongoose = require('mongoose');
const Schema = mongoose.Schema;



let LoanReviewSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    review_date: {type: Date, default:new Date()},
    reviewer_name: String,
    comments: String
    // Add other fields as per your requirements
});

module.exports = mongoose.model("Loan_review", LoanReviewSchema);
