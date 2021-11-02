if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const mongoose = require('mongoose');
const URI = process.env["APP_MONGO_BD_URL"];

const connectDB = async () => {
    await mongoose.connect(URI, {
        useNewUrlParser: true ,
        useUnifiedTopology: true
    });

    console.log('DB Connected');
};

module.exports = connectDB;