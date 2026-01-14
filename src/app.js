const express = require('express');
require('dotenv').config();
const { dbConnection } = require('./config/database.js');
const User = require('./models/user.js');
const authRouter = require('./routes/auth.routes.js')
const profileRouter = require('./routes/profile.routes.js');
const requestRoutrer = require('./routes/request.routes.js');
const cookieParser = require('cookie-parser');
const ConnectionRequest = require('./models/connectionRequest.js');
const userRouter = require('./routes/user.routes.js');
const cors = require('cors');


const app = express();
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRoutrer);
app.use('/', userRouter);

app.get('/allUsers', async (req, res) => {
    try {
        const users = await User.find({}, { _id: 1, firstName: 1, lastName: 1, emailId: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/allConnections', async (req, res) => {
    try {
        const users = await ConnectionRequest.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

dbConnection().then(async () => {
    console.log("Database connected successfully");
    await User.init();
    app.listen(7777, () => {
        console.log("Server is running on port 7777");
    })
}).catch((err) => {
    console.log("Database connection failed", err);
})

