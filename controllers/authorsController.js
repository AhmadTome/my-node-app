const Author = require('../DB/authors');

const addAuthors = async (req, res) => {
    let authorModel = new Author(req.body);
    await authorModel.save();
    res.json(authorModel);
}

const getAuthors = (req, res) => {
    Author.find({}, function(err, result) {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
}

module.exports = {addAuthors, getAuthors}