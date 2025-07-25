const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let InsurancePolicySchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    policy_number: String,
    coverage_type: String,
    premium_amount: Number,
    start_date: Date,
    end_date: Date
    // Add other fields as per your requirements
});
module.exports = mongoose.model("Insurance_Policy", InsurancePolicySchema);
