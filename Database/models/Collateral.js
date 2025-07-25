const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let CollateralSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    collateral_type: String,
    collateral_value: Number,
    collateral_description: String
});

module.exports = mongoose.model("Collateral", CollateralSchema);
