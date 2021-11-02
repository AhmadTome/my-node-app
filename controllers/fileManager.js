const fileManagerModel = require('../DB/fileManager');

const uploadFiles = async (req, res) => {
    if (req.files) {
        const files = req.files;
        try {
            await fileManagerModel.collection.insertMany(files);
        } catch (e) {
            console.log(e)
        }

        res.json({
            result: files
        })
    } else {
        res.status(422).json({
            result: "Please Upload files"
        })
    }

}

const getFiles = (req, res) => {
    fileManagerModel.find({}, function(err, result) {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(result);
        }
    });
}



module.exports = {
    uploadFiles,
    getFiles
}