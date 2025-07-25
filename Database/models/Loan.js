
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let LoanSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    loan_type: String,
    amount_approved: Number,
    amount_remained: Number,
    rate_of_interest: Number,
    term: Number,
    start_date: Date,
    end_date: Date,
    loan_application: { type: Schema.Types.ObjectId, ref: 'Loan_application' },
    payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
    loan_payment_history: [{ type: Schema.Types.ObjectId, ref: 'Loan_Payment_History' }],
    loan_repayment_plan: { type: Schema.Types.ObjectId, ref: 'Loan_Repayment_Plan' },
    loan_repayment_schedule: [{ type: Schema.Types.ObjectId, ref: 'Loan_Repayment_Schedule' }]
});

module.exports = mongoose.model("Loan", LoanSchema);
