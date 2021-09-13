const mongoose = require("mongoose");
const Book = require('../DB/Books');
const ReserveBook = require('../DB/BookReservations');
const authors = require('../DB/authors');

const addBook = async (req, res) => {
    let filePath = '';
    if (req.file) {
        filePath = req.file.path;
    }

    const BookTags = JSON.parse(req.body.BookTags);
    const author = req.body.BookAuthorId;
    const publisher = req.body.BookPublisherId;

    const bookInfo = {...req.body, filePath, BookTags, author, publisher};
    let bookModel = new Book(bookInfo);
    await bookModel.save();
    res.json(bookModel);
}

const getBooks = (req, res) => {

    Book.aggregate([
        {
            $lookup: {
                from: "authors", // collection name in db
                localField: "author",
                foreignField: "_id",
                as: "authors"
            }
        },
        {
            $lookup: {
                from: "publishers", // collection name in db
                localField: "publisher",
                foreignField: "_id",
                as: "publishers"
            }
        }

    ]).exec((err, result) => {
        res.json(result);
    });
}

const getBook = (req, res) => {

    const {id} = req.params;

    Book.aggregate([
        {
            $match: {
                _id: {$eq: mongoose.Types.ObjectId(id)}
            }
        },
        {
            $lookup: {
                from: "authors", // collection name in db
                localField: "author",
                foreignField: "_id",
                as: "authors"
            }
        },
        {
            $lookup: {
                from: "publishers", // collection name in db
                localField: "publisher",
                foreignField: "_id",
                as: "publishers"
            }
        },
        {$limit: 1}

    ]).exec((err, result) => {
        res.json(result);
    });

}

const search = (req, res) => {
    const params = req.query;
    const col = params.searchCategory;
    let queryForCategory = {};
    if (col == "Any") {
        queryForCategory = {
            $match: {
                $or: [
                    {"BookTitle": {$eq: params.inquiry}},
                    {"publishers.publisherName": {$eq: params.inquiry}},
                    {"authors.FirstName": {$eq: params.inquiry}},
                ]
            }
        };
    } else if (col == "Tags") {
        queryForCategory = {
            $match: {"BookTags.text": {$eq: params.inquiry}}
        };
    } else {
        queryForCategory = {$match: {[col]: {$eq: params.inquiry}}}
    }

    let conditions = [];
    if (params.availableUnitStart != "") {
        conditions.push({AvailableUnit: {$gte: params.availableUnitStart}})
    }
    if (params.availableUnitEnd != "") {
        conditions.push({AvailableUnit: {$lte: params.availableUnitEnd}})
    }
    if (params.unitPriceStart != "") {
        conditions.push({UnitPrice: {$gte: params.unitPriceStart}})
    }
    if (params.unitPriceEnd != "") {
        conditions.push({UnitPrice: {$lte: params.unitPriceEnd}})
    }



    let aggregateArray = [{
        $lookup: {
            from: "authors", // collection name in db
            localField: "author",
            foreignField: "_id",
            as: "authors",
        }
    },
        {
            $lookup: {
                from: "publishers", // collection name in db
                localField: "publisher",
                foreignField: "_id",
                as: "publishers"
            }
        },
        queryForCategory];


    let queryForFields = {};
    if (conditions.length > 0) {
        queryForFields = {
            $match: {
                $and: conditions
            }
        };

        aggregateArray.push(queryForFields);
    }


    Book.aggregate(aggregateArray).exec((err, result) => {
        console.log(err)
        res.json(result);
    });
}

const reserveBook = async (req, res) => {
    const BookId = req.body.BookId;
    delete req.body._id;
    const reserveInfo = {...req.body, BookId};
    let ReserveBookModel = new ReserveBook(reserveInfo);
    await ReserveBookModel.save();
    res.json(ReserveBookModel);
}

module.exports = {
    addBook,
    getBooks,
    getBook,
    search,
    reserveBook
}