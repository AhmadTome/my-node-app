const mongoose = require('mongoose');
const {Schema, modal} = require('mongoose');

const author = new mongoose.Schema({
    FirstName: {
        type: String
    },
    MiddleName: {
        type: String
    },
    LastName: {
        type: String
    },
    BirthDate: {
        type: Date
    },
    DeathDate: {
        type: Date
    },
    Country: {
        type: String
    },
    OfficialWebsite: {
        type: String
    }
});

module.exports = Author = mongoose.model('author', author);