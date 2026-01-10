const express = require('express');
const { userAuth } = require('../middlewares/auth.js');
const ConnectionRequest = require('../models/connectionRequest.js');
const { connection, connections } = require('mongoose');
const User = require('../models/user.js');
const userRouter = express.Router();

userRouter.get("/user/request/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const receivedRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: 'intrested'
        }).populate('fromUserId', ['firstName', 'lastName', 'photoURL', 'about']);
        res.status(200).json({
            message: loggedInUser.firstName + " Your all pending requests",
            data: receivedRequests
        });
    } catch (error) {

    }
})

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            $and: [
                { $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }] },
                { status: 'accepted' }
            ]

        })
            .populate('fromUserId', ["firstName", "lastName", "gender", "age", "about", "photoURL", "skills"])
            .populate('toUserId', ["firstName", "lastName", "gender", "age", "about", "photoURL", "skills"])

        const data = connectionRequests.map((connection) => connection.fromUserId._id.equals(loggedInUser._id) ? connection.toUserId : connection.fromUserId);

        res.status(200).json({
            message: loggedInUser.firstName + " all connections",
            data
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

userRouter.get("/user/feed", userAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }]
        }).select('fromUserId toUserId')

        const hiddenUserIds = new Set(
            connectionRequests.map((connection) => {
                if (connection.fromUserId.toString() === loggedInUser._id.toString()) {
                    return connection.toUserId.toString();
                }
                return connection.fromUserId.toString();
            })
        );

        const feedUsers = await User.find({
            $and: [
                { _id: { $nin: [...hiddenUserIds] } },
                { _id: { $ne: loggedInUser._id } }
            ]
        }).select('-password -emailId -createdAt -updatedAt -__v').skip(skip).limit(limit);

        res.status(200).json(feedUsers)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
module.exports = userRouter;