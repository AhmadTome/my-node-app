//import express from 'express';
var express = require('express');
const connectDB = require('../DB/connection');
var cors = require('cors');


const multer = require('multer');
const fileStorageEngin = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + ' -- ' + file.originalname)
    },
});
const upload = multer({storage: fileStorageEngin});

// bodyParser is a middleware
var bodyParser = require('body-parser');

connectDB();
// var app = express();
// app.use(cors());
var router = express.Router();
const UserModule = require('../controllers/userController.js');
const PublisherModule = require('../controllers/publisherController')
const AuthorModule = require('../controllers/authorsController')
const BookModule = require('../controllers/bookController')
//router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors());
router.use(bodyParser.json());




/* GET home page. */
router
    .post('/users', UserModule.addUser)
    .post('/publishers', PublisherModule.addPublisher)
    .post('/authors', AuthorModule.addAuthors)
    .post('/books', upload.single('file'), BookModule.addBook)
    .get('/publishers', PublisherModule.getPublishers)
    .get('/authors', AuthorModule.getAuthors)
    .get('/books', BookModule.getBooks)
    .get('/books/search', BookModule.search)
    .get('/books/:id', BookModule.getBook)
    .post('/books/:id/reserve', BookModule.reserveBook)

module.exports = router;
