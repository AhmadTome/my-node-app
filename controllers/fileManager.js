const fileManagerModel = require('../DB/fileManager');

const uploadFiles = async (req, res) => {
    const files = req.files;
    await fileManagerModel.collection.insertMany(files);

    res.json({
        result: files
    })
}

const getFiles = (req, res) => {
    fileManagerModel.find({}, function(err, result) {
        if (err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
}



module.exports = {
    uploadFiles,
    getFiles
}