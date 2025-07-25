
const mongoose = require('mongoose');
const Schema = mongoose.Schema;



let TransactionSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    transaction_date: {type:Date,default:new Date()},
    transaction_type: String,
    transaction_amount: Number,
    transaction_details:String,
    installment_number:Number,
    // Add other fields as per your requirements
});

module.exports = mongoose.model("Transactions", TransactionSchema);
