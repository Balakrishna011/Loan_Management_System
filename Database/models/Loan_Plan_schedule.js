const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let LoanRepaymentPlanSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    plan_name: String,
    plan_description: String,
    plan_ROI: Number,
    plan_term: Number
    // Add other fields as per your requirements
});


module.exports = mongoose.model("Loan_Plan_Schedule", LoanRepaymentPlanSchema);
