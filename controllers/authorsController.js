const Author = require('../DB/authors');
const {validationResult } = require('express-validator');

const addAuthors = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let authorModel = new Author(req.body);
    try{
        await authorModel.save();
    } catch (err){
        console.log(e)
    }
    res.json(authorModel);
}

const getAuthors = (req, res) => {
    Author.find({}, function(err, result) {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(result);
        }
    });
}

module.exports = {addAuthors, getAuthors}