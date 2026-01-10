const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 30,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email address : ' + value);
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error('Password is not strong enough. ' + value);
            }
        }
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        lowercase: true,
        validate(value) {
            if (!['male', 'female', 'other'].includes(value)) {
                throw new Error(' Gender must be male, female, or other');
            }
        }
    },
    photoURL: {
        type: String,
        default: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp',
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error('Invalid photo URL : ' + value);
            }
        }
    },
    about: {
        type: String,
        default: 'This is a default about the user!',
    },
    skills: {
        type: [String],
        default: ['JavaScript'],
        validate(value) {
            if (value.length < 1 || value.length > 10) {
                throw new Error('A user must have greater then 1 and less then 10 skill.');
            }
        }
    }
}, { timestamps: true });

userSchema.methods.generateJWT = async function () {
    const user = this;
    const token = await jwt.sign({ userId: user._id }, "dev@tinder#123", { expiresIn: '1h' });
    return token;
}

//userSchema.methods.hashPassword = async function () {
//    const user = this;
//    const hashedPassword = await bcrypt.hash(user.password, 10);
//    user.password = hashedPassword;
//}

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.validatePassword = async function (userInputPassword) {
    const user = this;
    const isPasswordMatch = await bcrypt.compare(userInputPassword, user.password);
    return isPasswordMatch;
}
const User = mongoose.model('User', userSchema);
module.exports = User;

