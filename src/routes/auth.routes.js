const express = require('express');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const { validateSignUpData } = require('../utils/validation.js');

authRouter.post('/signup', async (req, res) => {
    try {
        validateSignUpData(req);
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        const token = await savedUser.generateJWT();
        res.cookie("token", token, { expires: new Date(Date.now() + 60 * 60 * 1000) });


        return res.status(201).json({ message: "User registered successfully", data: newUser });
    } catch (err) {

        if (err.code === 11000) {
            return res.status(409).json(
                {
                    message: "Email Already Exists"
                }
            )
        }
        return res.status(500).json({ error: err.message });

    }

});

authRouter.post('/login', async (req, res) => {
    const { emailId, password } = req.body;

    try {
        const user = await User.findOne({ emailId });
        if (!user) {
            throw new Error('Invalid Credentials');
        }

        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            throw new Error("Invalid Credentials")
        }

        const token = await user.generateJWT();
        res.cookie("token", token, { httpOnly: true, secure: false, expires: new Date(Date.now() + 60 * 60 * 1000) });

        return res.status(200).json({
            message: "Login successfully",
            user
        })
    } catch (error) {
        res.status(400).json({
            message: "Login Error",
            error: error.message
        })
    }
});

authRouter.post('/logout', (req, res) => {
    res.cookie("token", null, { expires: new Date(Date.now()) })
    res.status(200).json({ message: "Logout Successfully" });
})

module.exports = authRouter;