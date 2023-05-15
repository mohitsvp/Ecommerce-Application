const mongoose = require('mongoose');

const connect = () => {
    try {
        mongoose.connect(process.env.DB_URL);
        console.log('Database connection established');
    } catch (error) {
        console.log('Error connecting to Database');
    }
}

module.exports = connect;