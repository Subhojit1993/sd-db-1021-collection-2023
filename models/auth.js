const validator = require('validator');
const { isPasswordModified } = require('../utils/common');

let validAccount = {
    _id: {
        type: String
    },
    username: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (validator.isEmail(value)) return true;
            return false;
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate(value) {
            if (!value.toLowerCase().includes('password')) return true;
            return false;
        }
    }
}

module.exports = { validAccount };