const express = require('express');
const { userAuth } = require('../middlewares/auth.js');
const ConnectionRequest = require('../models/connectionRequest.js');
const User = require('../models/user.js');

const requestRoutrer = express.Router();

requestRoutrer.post('/request/send/:status/:userId', userAuth, async (req, res) => {
    try {
        const fromUser = req.user._id;
        const toUser = req.params.userId;
        const status = req.params.status;


        const allowedStatus = ['ignored', 'intrested'];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const user = await User.findById(toUser);
        if (!user) {
            return res.status(404).json({ error: 'Recipient user not found' });
        }

        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId: fromUser, toUserId: toUser },
                { fromUserId: toUser, toUserId: fromUser }
            ]
        });

        if (existingRequest) {
            return res.status(409).json({
                request: "failed",
                message: "Connection request already exists between these users"
            })
        }

        //if (fromUser.toString() === toUser.toString()) {
        //    return res.status(400).json({
        //        request: "failed",
        //        message: "Users cannot send connection requests to themselves"
        //    })
        //}

        const connection = new ConnectionRequest({
            fromUserId: fromUser,
            toUserId: toUser,
            status: status
        });
        await connection.save();

        res.status(201).json({ message: req.user.firstName + " " + status + " " + user.firstName, connection });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

requestRoutrer.post('/request/review/:status/:requestId', userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;
        const allowedStatus = ["accepted", "rejected"];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ error: "Invalid status value" });
        }
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "intrested"
        });
        if (!connectionRequest) {
            return res.status(404).json({ status: "connection request not found" });
        }
        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.status(200).json({
            message: `Connection request ${status} successfully`,
            data
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
})

module.exports = requestRoutrer;