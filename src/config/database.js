const mongoose = require('mongoose');

const dbConnection = async () => {
    await mongoose.connect('mongodb+srv://shivbagupta:5UkttqOkOvux1cvk@namastenode.ckuc0.mongodb.net/Tinder');
}

module.exports = { dbConnection };

