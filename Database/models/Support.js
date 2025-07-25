const mongoose = require('mongoose');
const Schema = mongoose.Schema;


let SupportSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    query_type: String,
    contact: String,
    email: String,
    query:String
});

module.exports = mongoose.model("Support", SupportSchema);
