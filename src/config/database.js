const mongoose = require('mongoose');

console.log(process.env.DB_URL);

const dbConnection = async () => {
    await mongoose.connect(process.env.DB_URL);
}

module.exports = { dbConnection };

