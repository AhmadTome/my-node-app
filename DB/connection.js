const mongoose = require('mongoose');

const URI = 'mongodb+srv://root:root@cluster0.dcgkj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const connectDB = async () => {
    await mongoose.connect(URI, {
        useNewUrlParser: true ,
        useUnifiedTopology: true
    });

    console.log('DB Connected');
};

module.exports = connectDB;