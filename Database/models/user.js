const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schemas for each entity
let UserSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    address: String,
    mobile_number: String,
    email:{
        type: String,
        required: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
        unique: true
    },
    SSN: String,
    DOB: Date,
    password:String,
    credit_score: { type: Schema.Types.ObjectId, ref: 'Credit_score' },
    support: { type: Schema.Types.ObjectId, ref: 'Support' },
    transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
    insurance_policies: [{ type: Schema.Types.ObjectId, ref: 'Insurance_Policy' }],
    loan_applications: [{ type: Schema.Types.ObjectId, ref: 'Loan_application' }]
});

module.exports = mongoose.model("User", UserSchema);
