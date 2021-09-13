const Publisher = require('../DB/publishers')

const addPublisher = async (req, res) => {
    let publisherModel = new Publisher(req.body);
    await publisherModel.save();
    res.json(publisherModel);
}

const getPublishers = (req, res) => {
    Publisher.find({}, function(err, result) {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
}

module.exports = {addPublisher, getPublishers}