const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let LoanApplicationSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    app_date:{ type:Date,default:new Date()},
    app_status: {type:String,default:'Requested'},
    term:Number,
    amount_requested: Number,
    start_date:String,
    end_date:String,
    purpose: String,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    collateral: { type: Schema.Types.ObjectId, ref: 'Collateral' },
    loan: { type: Schema.Types.ObjectId, ref: 'Loan' },
    loan_review: { type: Schema.Types.ObjectId, ref: 'Loan_review' },
    
});

module.exports = mongoose.model("Loan_application", LoanApplicationSchema);