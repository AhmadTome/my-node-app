const mongoose = require('mongoose');
const {Schema, modal} = require('mongoose');


const fileManager = new mongoose.Schema({
    fieldname: {
        type: String
    },
    originalname: {
        type: String
    },
    encoding: {
        type: String
    },
    mimetype: {
        type: String
    },
    destination: {
        type: String
    },
    filename: {
        type: String
    },
    path: {
        type: String
    },
    size: {
        type: String
    }
});

module.exports = Book = mongoose.model('fileManager', fileManager);