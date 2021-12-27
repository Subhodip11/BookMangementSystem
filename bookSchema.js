const mongoose = require('mongoose');
const { Schema } = mongoose;

const addBook = new Schema({
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
    publishDate: {
        type: String,
        required: true
    }

})

const bookModel = mongoose.model('publishedBooksDB', addBook);
module.exports = bookModel;