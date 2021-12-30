const mongoose = require('mongoose');
const { Schema } = mongoose;

const addBook = new Schema({
    bookId: {
        type: Number,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    bookName: {
        type: String,
        required: true
    },
    bookPrice: {
        type: String,
        required: true
    },
    bookGenre: {
        type: String,
        required: true
    },
    publishDate: {
        type: String,
        required: true
    },
    checkIssued: {
        type: Boolean,
        default: true
    }

})

const bookModel = mongoose.model('publishedBooksDB', addBook);
module.exports = bookModel;