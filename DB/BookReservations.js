const mongoose = require('mongoose');
const {Schema, modal} = require('mongoose');
const Book = require('../DB/Books');


const reserveBook = new mongoose.Schema({
    BookId: {
        type: Schema.ObjectId,
        ref: Book
    },
    BuyerName: {
        type: String
    },
    BuyerAddress: {
        type: String
    },
    BuyerPhoneNumber: {
        type: String
    },
    NotionalId: {
        type: String
    },
    numberOfUnit: {
        type: String
    },
    purchaseDate: {
        type: Date
    },
    TotalPrice: {
        type: Number
    },
    buyer_name: {
        type: String,
        DEFAULT: "ADMIN"
    },
    action: {
        type: String,
        DEFAULT: "TOB"
    }
});

module.exports = ReserveBook = mongoose.model('reserveBook', reserveBook);