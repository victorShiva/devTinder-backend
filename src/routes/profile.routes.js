const express = require('express');
const { userAuth } = require('../middlewares/auth.js');
const { validateProfileEditData, validatePasswordChangeData } = require('../utils/validation.js');

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        return res.status(200).json({ user: req.user })
    } catch (err) {
        return res.status(401).json({ error: err.message })
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        validateProfileEditData(req.body);
        const loggedInUser = req.user;
        const updatedUser = Object.assign(loggedInUser, req.body);
        await updatedUser.save();
        return res.status(200).json({ message: `${loggedInUser.firstName} Profile updated successfully`, data: updatedUser });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        validatePasswordChangeData(req.body);
        loggedInUser.password = req.body.newPassword;
        await loggedInUser.save();
        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
})
module.exports = profileRouter;