const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let LoanRepaymentScheduleSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    installment_number: Number,
    due_date: Date,
    principal_amount: Number,
    interest_amount: Number,
    amount_due: Number,
    loan:{ type: Schema.Types.ObjectId, ref: 'Loan' }
});

module.exports = mongoose.model("Loan_Repayment_Schedule", LoanRepaymentScheduleSchema);
