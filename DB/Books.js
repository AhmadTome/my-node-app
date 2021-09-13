const mongoose = require('mongoose');
const {Schema, modal} = require('mongoose');
const Publisher = require('../DB/publishers');


const book = new mongoose.Schema({
    BookId: {
        type: String
    },
    BookTitle: {
        type: String
    },
    BookPublisherId: {
        type: String
    },
    PublisherDate: {
        type: Date
    },
    BookAuthorId: {
        type: String
    },
    BookTags: {
        type: Array
    },
    AvailableUnit: {
        type: String
    },
    UnitPrice: {
        type: String
    },
    filePath: {
        type: String
    },
    author: {
        type: Schema.ObjectId,
        ref: Author
    },
    publisher: {
        type: Schema.ObjectId,
        ref: Publisher
    }
});

module.exports = Book = mongoose.model('book', book);