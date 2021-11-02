if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const mongoose = require('mongoose');
//const URI = process.env["APP_MONGO_BD_URL"];
const URI = 'mongodb+srv://root:root@cluster0.dcgkj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const connectDB = async () => {
    await mongoose.connect(URI, {
        useNewUrlParser: true ,
        useUnifiedTopology: true
    });

    console.log('DB Connected');
};

module.exports = connectDB;