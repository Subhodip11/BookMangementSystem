const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookIssue = new Schema({
    nameOfIssuer: {
        type: String,
        required: true
    },
    regNoOfUser: {
        type: String,
        required: true
    },
    bookObjInfo: {
        type: String,
        required: true
    },

    daysIssued: {
        type: Number,
        default: 3
    },
})

let bookIssuedModel = mongoose.model('bookIssuedDB', bookIssue);

module.exports = bookIssuedModel;