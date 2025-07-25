const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let PaymentSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    amount: Number,
    payment_date: {type:Date,default:new Date()}
    // Add other fields as per your requirements
});

module.exports = mongoose.model("Payment", PaymentSchema);
