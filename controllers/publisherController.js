const Publisher = require('../DB/publishers')
const {validationResult } = require('express-validator');

const addPublisher = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    let publisherModel = new Publisher(req.body);
    res.send(req.body)

    try{
        await publisherModel.save();
    } catch (err) {
        console.log(e)

    }

    res.json(publisherModel);
}

const getPublishers = (req, res) => {
    Publisher.find({}, function(err, result) {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(result);
        }
    });
}

module.exports = {addPublisher, getPublishers}