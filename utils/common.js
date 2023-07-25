const fs = require('fs');
const bcrypt = require('bcryptjs');
const PASSWORD = "password";

// common imports
const storagePath = "./public/storage.json";
const accountsPath = "./public/auth.json";

// util functions

// save data
const saveData = (dataPath, data) => {
    // get the data stringified
    const stringifyData = JSON.stringify(data);
    // write the stringified data into the file using writeFileSync method
    fs.writeFileSync(dataPath, stringifyData)
}

// read data
const getData = (dataPath) => {
    // get the data from the file
    const jsonData = fs.readFileSync(dataPath);
    // get the data stringfied first
    const jsonDataBuffer = jsonData.toString();
    // return the parsed buffered data
    return JSON.parse(jsonDataBuffer);
}

const isUserExists = (user, path) => {
    // get the exisiting users
    const existingAccounts = getData(path);
    // initialize the found user
    let foundUser = null;
    // get the user if exisiting
    if (existingAccounts) foundUser = existingAccounts.find(account => account.email === user.email);
    // return the found user
    return foundUser;
}

const isPasswordModified = async (user, exisitingUser) => {
    // initialize the conditional statement => isMatch => checks if password is modified or not
    let isMatch = await bcrypt.compare(user[PASSWORD], exisitingUser[PASSWORD]);
    // return => is password modified or not
    return !isMatch;
}

module.exports = { saveData, getData, accountsPath, storagePath, isUserExists, isPasswordModified, PASSWORD };