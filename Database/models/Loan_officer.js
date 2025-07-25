const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let LoanOfficerSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    officer_name: String,
    officer_email:  {
        type: String,
        required: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
        unique: true
    },
    officer_mobile_number: String,
    password:String,
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    loan_applications: [{Loan_applicationId:{ type: Schema.Types.ObjectId, ref: 'Loan_application' }}]
});
module.exports = mongoose.model("Loan_officer", LoanOfficerSchema);
