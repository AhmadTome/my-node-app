
const {body, check} = require('express-validator')

const BookId = body('BookId').notEmpty();
const BookTitle = body('BookTitle').notEmpty();
const BookPublisherId = body('BookPublisherId').notEmpty();
const BookAuthorId = body('BookAuthorId').notEmpty();
const PublisherDate = body('PublisherDate').isDate();
const establishDate = body('PublisherDate').isDate();
const AvailableUnit = body('AvailableUnit').isInt();
const UnitPrice = body('UnitPrice').isDecimal();


const FirstName = body('FirstName').notEmpty();



const AddBookValidation = [
    BookId,
    BookTitle,
    BookPublisherId,
    BookAuthorId,
    PublisherDate,
    AvailableUnit,
    UnitPrice
];

const AddAuthor = [
    FirstName
];

const AddPublisher = [
    establishDate
];


    module.exports = {
        AddBookValidation,
        AddAuthor,
        AddPublisher
    }
