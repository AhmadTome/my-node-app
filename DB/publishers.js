const mongoose = require('mongoose');

const publisher = new mongoose.Schema({
    publisherName: {
        type: String
    },
    establishDate: {
        type: Date
    },
    isStillWorking: {
        type: Boolean
    }
});

module.exports = Publisher = mongoose.model('publisher', publisher);