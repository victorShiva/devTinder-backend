const validator = require('validator');

const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;
    if (!firstName || !lastName) {
        throw new Error("Enter valid Name")
    } else if (!validator.isEmail(emailId)) {
        throw new Error("Please enter valid email")
    } else if (!validator.isStrongPassword(password)) {
        throw new Error('Enter a strong password')
    }
}

const validateProfileEditData = (data) => {
    const allowedUpdateFields = ["firstName", "lastName", "age", "gender", "about", "photoURL", "skills"];
    for (const field in data) {
        if (!allowedUpdateFields.includes(field)) {
            throw new Error(`Invalid field: ${field}`);
        }
    }
}

const validatePasswordChangeData = (data) => {
    const { newPassword, confirmPassword } = data;
    if (!newPassword || !confirmPassword) {
        throw new Error("Both newPassword and confirmPassword are required.");
    }
    if (newPassword !== confirmPassword) {
        throw new Error("newPassword and confirmPassword do not match.");
    }
}
module.exports = {
    validateSignUpData,
    validateProfileEditData,
    validatePasswordChangeData
}