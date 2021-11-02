const mongoose = require("mongoose");
const Book = require('../DB/Books');
const ReserveBook = require('../DB/BookReservations');
const authors = require('../DB/authors');
const {validationResult } = require('express-validator');
const Excel = require('exceljs');
const Author = require('../DB/authors');
const Publisher = require('../DB/publishers');
const xlsx = require('xlsx');


const addBook = async (req, res) => {


    let errors = validationBook(req);

    if (errors.length > 0) {
        return res.status(422).json({ errors: errors });
    }


    let filePath = '';
    if (req.file) {
        filePath = req.file.path;
    }

    const BookTags = JSON.parse(req.body.BookTags);
    const author = req.body.BookAuthorId;
    const publisher = req.body.BookPublisherId;

    const bookInfo = {...req.body, filePath, BookTags, author, publisher};
    let bookModel = new Book(bookInfo);
    try{
        await bookModel.save();
    }catch (err){
        console.log(e)

    }
    res.json(bookModel);
}

const getBooks = (req, res) => {

    Book.aggregate([
        {
            $facet: {
                edges: [
                    { $skip: 5 },
                    { $limit: 10 },
                ],
            },
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
        }
    ]).exec((err, result) => {
        res.json({
            'result': result,
            total_record: result[0]['edges'].length
        });
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
                        {"BookTitle": {$regex: '.*'+params.inquiry+'.*'}},
                        {"publishers.publisherName": {$regex: '.*'+params.inquiry+'.*'}},
                        {"authors.FirstName": {$regex: '.*'+params.inquiry+'.*'}},
                    ]
                }
            };

    }
    else if (col == "Tags") {
        queryForCategory = {
            $match: {"BookTags.text": {$eq: params.inquiry}}
        };
    }
    else {
        //queryForCategory = {$match: {[col]: {$eq: params.inquiry}}}
        queryForCategory = {$match: {[col]: {$regex: '.*'+params.inquiry+'.*'}}}
    }

    let conditions = [];
    if (params.availableUnitStart != "") {
        conditions.push({AvailableUnit: {$gte: parseInt(params.availableUnitStart)}})
    }
    if (params.availableUnitEnd != "") {
        conditions.push({AvailableUnit: {$lte: parseInt(params.availableUnitEnd) }})
    }
    if (params.unitPriceStart != "") {
        conditions.push({UnitPrice: {$gte: parseInt(params.unitPriceStart)}})
    }
    if (params.unitPriceEnd != "") {
        conditions.push({UnitPrice: {$lte: parseInt(params.unitPriceEnd)}})
    }

    const pagination = {
        $facet: {
            edges: [
                { $skip: (10 * (parseInt(params.page) -1)) },
                { $limit: 10 },
            ],
            pageInfo: [
                { $group: { _id: null, count: { $sum: 1 } } },
            ],
        },
    };

    let aggregateArray = [
        {
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
        }
    ];

    if (params.availableUnitStart != "" || params.availableUnitEnd != "" || params.unitPriceStart != "" || params.unitPriceEnd != "" || params.inquiry != "") {
        aggregateArray.push(queryForCategory)
    }


    let queryForFields = {};
    if (conditions.length > 0) {
        queryForFields = {
            $match: {
                $and: conditions
            },
        };
        aggregateArray.push(queryForFields);
    }


    Book.aggregate(aggregateArray).exec((err, result) => {
        const total_record = result.length;

        aggregateArray.push(pagination);
        Book.aggregate(aggregateArray).exec((err, result) => {
            res.json({
                'result': result,
                //total_record: result[0]['edges'].length
                total_record: total_record
            });
        });
    });




}

const reserveBook = async (req, res) => {
    const BookId = req.body.BookId;
    const _id = req.body._id;
    delete req.body._id;
    const reserveInfo = {...req.body, BookId};
    let ReserveBookModel = new ReserveBook(reserveInfo);
    try{
        await ReserveBookModel.save();
    }catch (err){
        console.log(e)

    }

    const numberOfUnit = parseInt(req.body.numberOfUnit);
    const book = Book.find({_id: _id}).exec((err, result) => {
        const availableUnit = parseInt(result[0].AvailableUnit);
        Book.findByIdAndUpdate({_id},{AvailableUnit: (availableUnit - numberOfUnit)}).exec((err, result) => {
            res.json(ReserveBookModel);
        });
    });
}

const getPurchased = (req, res)=> {
    const params = req.query;
    const col = params.searchCategory;


    let queryForCategory = {};
    if (col == "Any") {
        queryForCategory = {
            $match: {
                $or: [
                    {"BookTitle": {$regex: '.*'+params.inquiry+'.*'}},
                    {"publishers.publisherName": {$regex: '.*'+params.inquiry+'.*'}},
                    {"authors.FirstName": {$regex: '.*'+params.inquiry+'.*'}},
                    {"buyer_name": {$regex: '.*'+params.inquiry+'.*'}},
                ]
            }
        };

    }
    else {
        queryForCategory = {$match: {[col]: {$regex: '.*'+params.inquiry+'.*'}}}
    }

    let conditions = [];
    if (params.purchase_date != "") {
        conditions.push({purchaseDate: {$eq: new Date(params.purchase_date)}})
    }

    const pagination = {
        $facet: {
            edges: [
                { $skip: (10 * (parseInt(params.page) -1)) },
                { $limit: 10 },
            ],
            pageInfo: [
                { $group: { _id: null, count: { $sum: 1 } } },
            ],
        },
    };

    let aggregateArray = [
        {
            $lookup: {
                from: "books", // collection name in db
                localField: "BookId",
                foreignField: "_id",
                as: "Book",
            }
        },
        {
            $lookup: {
                from: "authors", // collection name in db
                localField: "Book.author",
                foreignField: "_id",
                as: "authors",
            }
        },
        {
            $lookup: {
                from: "publishers", // collection name in db
                localField: "Book.publisher",
                foreignField: "_id",
                as: "publishers"
            }
        }
    ];

    if (params.purchase_date != "" ||  params.inquiry != "") {
        aggregateArray.push(queryForCategory)
    }

    let queryForFields = {};
    if (conditions.length > 0) {
        queryForFields = {
            $match: {
                $and: conditions
            },
        };
        aggregateArray.push(queryForFields);
    }


    ReserveBook.aggregate(aggregateArray).exec((err, result) => {
        const total_record = result.length;

        aggregateArray.push(pagination);
        ReserveBook.aggregate(aggregateArray).exec((err, result) => {
            res.json({
                'result': result,
                //total_record: result[0]['edges'].length
                total_record: total_record
            });
        });
    });

}

const dowmloadTemplate = async (req, res) => {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("My Sheet");

    worksheet.columns = [
        {header: 'Book Id', key: 'BookId', width: 15},
        {header: 'Book Title', key: 'BookTitle', width: 15},
        {header: 'publisher Name', key: 'publisherName', width: 32},
        {header: 'Publisher Date', key: 'PublisherDate', width: 15},
        {header: 'Author Name', key: 'FirstName', width: 32},
        {header: 'Book Tags', key: 'BookTags', width: 15},
        {header: 'Available Unit', key: 'AvailableUnit', width: 15},
        {header: 'Unit Price', key: 'UnitPrice', width: 15},
        {header: 'File Name', key: 'filePath', width: 15},
    ];

    let authors = await Author.find({});
    let authorNames = authors.reduce((acc, author)=>{
        return acc + author.FirstName+",";
    }, "");

    for (let i=0; i<10;i++) {
        worksheet.getCell('E'+(i+1)).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"' +authorNames+ '"']
        };
    }

    let publishers = await Publisher.find({});
    let publisherNames = publishers.reduce((acc, publisher)=>{
        return acc + publisher.publisherName+",";
    }, "");

    for (let i=0; i<10;i++) {
        worksheet.getCell('C'+(i+1)).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"' +publisherNames+ '"']
        };
    }

    // save under export.xlsx
  // await workbook.xlsx.writeFile('BookTemplate.xlsx');



    workbook.xlsx.write(res).then(function () {
        res.status(200).end();
    });

    // res.json({
    //     result: 'the file BookTemplate.xlsx downloaded successfully',
    //     path: "/BookTemplate.xlsx"
    // });

}

const bulk_insert = async (req, res) => {

    let filePath = '';
    if (req.file) {
        filePath = req.file.path;
        let workBook = xlsx.readFile(filePath);

        let workSheet = workBook.Sheets[workBook.SheetNames[0]];

        let bookToInsert = [];
        let index = 2;
        while (workSheet[`A${index}`]) {
            const path = "uploads\\";
            const BookId = workSheet[`A${index}`] ? workSheet[`A${index}`].v : "";
            const BookTitle = workSheet[`B${index}`] ? workSheet[`B${index}`].v : "" ;
            const BookPublisherId = workSheet[`C${index}`] ? workSheet[`C${index}`].v : "";
            const PublisherDate = workSheet[`D${index}`] ? workSheet[`D${index}`].v : "";
            const BookAuthorId = workSheet[`E${index}`] ? workSheet[`E${index}`].v : "";
            const BookTags = workSheet[`F${index}`] ? workSheet[`F${index}`].v : "";
            const AvailableUnit = workSheet[`G${index}`] ? workSheet[`G${index}`].v : "";
            const UnitPrice = workSheet[`H${index}`] ? workSheet[`H${index}`].v : "";
            const filePath = workSheet[`I${index}`] ? path + workSheet[`I${index}`].v : "";
            index++;
            bookToInsert.push({BookId, BookTitle, BookPublisherId, PublisherDate, BookAuthorId, BookTags, AvailableUnit, UnitPrice,filePath})

        }

        const authors = await getAuthors();
        const publisher = await getPublishers();

        // validation

        var isNotValid = bookToInsert.some((row)=> {
            return !row.BookId
                || !row.BookTitle
                || !row.BookPublisherId
                || !publisher[row.BookPublisherId]
                || !row.PublisherDate
                || !row.BookAuthorId
                || !authors[row.BookAuthorId]
                || !row.BookTags
                || !row.AvailableUnit
                || !row.UnitPrice
        });

        if (isNotValid) {
            return res.status(422).json({
                error: "there is an issue in the data of the imported file"
            });
        }

        let filteredBookToInsert = bookToInsert.map((row)=> {
            return {...row, BookPublisherId: publisher[row.BookPublisherId], BookAuthorId: authors[row.BookAuthorId], author: authors[row.BookAuthorId], publisher: publisher[row.BookPublisherId]}
        });

        // bulk insert
        await Book.collection.insertMany(filteredBookToInsert);
        return res.status(200).json({
            result: "The books Added Successfully"
        });
    } else {
        res.json({
            error: "Please select file"
        })

    }
}

const getAuthors = async () => {
    let authors = await Author.find({});
    let authorsFiltered = {};
    authors.map((author)=>{
        authorsFiltered[author.FirstName] = author._id;
    });
    return authorsFiltered;
}

const getPublishers = async () => {
    let publishers = await Publisher.find({});
    let publishersFiltered = {};
    publishers.map((publisher)=>{
        publishersFiltered[publisher.publisherName] = publisher._id;
    });
    return publishersFiltered;
}

function validationBook(req) {
    const {BookId, BookTitle, BookPublisherId, PublisherDate, BookAuthorId, BookTags, AvailableUnit, UnitPrice} = req.body;
    let errors = [];
    if (BookId == "" || BookId === "undefined") {
        errors.push({
            key: "BookId",
            error: "The Book Id Can't be empty"
        })
    }

    if (BookTitle == "" || BookTitle === "undefined") {
        errors.push({
            key: "BookTitle",
            error: "The Book Title Can't be empty"
        })
    }

    if (BookPublisherId == "" || BookPublisherId === "undefined") {
        errors.push({
            key: "BookPublisherId",
            error: "The Book Publisher Can't be empty"
        })
    }

    if (PublisherDate == "" || PublisherDate === "undefined") {
        errors.push({
            key: "PublisherDate",
            error: "The Book Date Can't be empty"
        })
    }

    if (BookAuthorId == "" || BookAuthorId === "undefined") {
        errors.push({
            key: "BookAuthorId",
            error: "The Book Author Can't be empty"
        })
    }

    if (isNaN(AvailableUnit)) {
        errors.push({
            key: "AvailableUnit",
            error: "The Available Unit must be an number"
        })
    }
    if (isNaN(UnitPrice)) {
        errors.push({
            key: "UnitPrice",
            error: "The Unit Price must be an number"
        })
    }

    return errors;
}


module.exports = {
    addBook,
    getBooks,
    getBook,
    search,
    reserveBook,
    getPurchased,
    dowmloadTemplate,
    bulk_insert
}