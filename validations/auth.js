const bcrypt = require('bcryptjs');
const { isUserExists, isPasswordModified, PASSWORD, accountsPath } = require("../utils/common");
const { validAccount } = require('../models/auth');
const initialState = { error: false, msg: '' };

// data validation and sanitizations
const permission = (user, updatePermission) => {
    // Initialize validation error
    let validationError = initialState;
    // extract the keys from req body
    let keys = Object.keys(user);
    // if new user
    if (!updatePermission) {
        // loop through each keys in valid account
        for (let requiredKey in validAccount) {
            // check if request Body includes the required keys
            if (validAccount[requiredKey].required && !keys.includes(requiredKey)) {
                validationError.error = true;
                validationError.msg = `${requiredKey} is required`;
                return validationError;
            }
        }
    }
    // loop through each key from user
    for (let key of keys) {
        // If key is not present in valid account
        if (!validAccount.hasOwnProperty(key)) {
            // set validation error
            validationError.error = true;
            validationError.msg = `${key} is not supported`;
            break;
            // return validationError;
        }
        // If the required key value is empty or null
        if (!updatePermission && (user[key] === "" || user[key] === null) && validAccount[key].required) {
            validationError.error = true;
            validationError.msg = `${key} is not valid`;
            break;
        }
        // If the key is not valid
        if (validAccount[key].validate && !(validAccount[key].validate(user[key]))) {
            validationError.error = true;
            validationError.msg = `${key} is invalid`;
            break;
        }
        // If the key value length is less than minimum required length
        if (validAccount[key].minLength && user[key].length < validAccount[key].minLength) {
            validationError.error = true;
            validationError.msg = `Minimum length of the ${key} should be above ${validAccount[key].minLength}`;
            break;
        }
        // If the key is not matching the valid accounts lowercase condition
        if (validAccount[key].lowercase && user[key] !== user[key].toLowerCase()) {
            validationError.error = true;
            validationError.msg = `${key} should be in lowercase letters`;
            break;
        }
    }
    // if no validation error
    if (!validationError.error) {
        // check if the user exist
        let isUserExist = isUserExists(user, accountsPath);
        // if exists
        if (isUserExist) {
            // set validations
            validationError.error = true;
            validationError.msg = `${user.email} already exists`;
            // return error
            return validationError;
        }
    }
    // return the validation
    return validationError;
}

const trimmedContent = (user) => {
    let trimmedUser = { ...user };
    // for each key of response body
    for (let key in trimmedUser) {
        if (key !== PASSWORD) trimmedUser[key] = trimmedUser[key].trim();
    }
    // return new state
    return trimmedUser;
}

const encrypt = async (user) => {
    // initialize the updated state of the user
    let updatedUser = { ...user }
    // encrypt password
    updatedUser[PASSWORD] = await bcrypt.hash(updatedUser[PASSWORD], 8);
    // return the updated user
    return updatedUser;
}

module.exports = { permission, trimmedContent, encrypt };