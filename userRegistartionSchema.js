const mongoose = require('mongoose');
const { Schema } = mongoose;

const userDetails = new Schema({
    userName: { type: String, required: true },
    password: { type: String, required: true },
    registrationNumber: { type: Number, required: true },
    email: { type: String, required: true },
    mobileNumber: { type: Number, required: true }
})

const userDetailsModel = mongoose.model('userRegistration', userDetails);

module.exports = userDetailsModel;