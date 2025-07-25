const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let LoanPaymentHistorySchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    loan_ID: { type: Schema.Types.ObjectId, ref: 'Loan' },
    payment_date: {type :Date,default:new Date()},
    paid_amount: Number,
    late_fee: Number,
    installment_number:Number
});

module.exports = mongoose.model("Loan_Payment_History", LoanPaymentHistorySchema);
