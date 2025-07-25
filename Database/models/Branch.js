const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let BranchSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    branch_name: String,
    branch_location: String,
    loan_officers: [{ type: Schema.Types.ObjectId, ref: 'Loan_officer' }]
})


module.exports = mongoose.model("Branch", BranchSchema);