const fs = require('fs');
const bcrypt = require('bcryptjs');
const EMAIL = "email";
const PASSWORD = "password";

// common imports
const STORAGE_PATH = "./public/storage.json";
const ACCOUNTS_PATH = "./public/auth.json";

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

// check if exists
const findByProperty = (element, property, path) => {
    // get the exisiting elements
    const existings = getData(path);
    // initialize the found element
    let found = null;
    // get the element if exisiting
    if (existings) found = existings.find(existing => existing[property] === element[property]);
    // return the found element
    return found;
}

const isPasswordModified = async (updated, exisiting) => {
    // initialize the conditional statement => isMatch => checks if password is modified or not
    let isMatch = await bcrypt.compare(updated[PASSWORD], exisiting[PASSWORD]);
    // return => is password modified or not
    return !isMatch;
}

const includeInStore = (element, path) => {
    // get the exisiting accounts data
    const existings = getData(path);
    existings.push(element);
    // update the data store
    saveData(path, existings);
}

const updateInStore = (element, path) => {
    // get the exisiting accounts data
    const existingElements = getData(path);
    // set the body obj in the existing user Accounts using id
    let updatedElements = existingElements.map(item => item._id === element._id ? element : item);
    // update the data store
    saveData(path, updatedElements);
}

const removeFromStore = (element, path) => {
    // get the exisitng element
    const exisitingStore = getData(path);
    // remove element from the store
    let updatedStore = exisitingStore.filter(item => item._id !== element._id);
    // update the store
    saveData(path, updatedStore);
}

const findById = (element, path) => {
    const { id } = element;
    // get the exisiting data
    const existingElements = getData(path);
    // find the element from the list
    // set the body obj in the existing user Accounts using id
    const existingElement = existingElements.find(item => item._id === parseInt(id));
    // return the exisitng element
    return existingElement;
}

const findByCredentials = (element, path) => {
    const { username, email } = element;
    // get the exisiting data
    const existingElements = getData(path);
    // find the element from the list
    // find using credentials
    const existingElement = existingElements.find(item => (username && (item.username === username || item.email === username) || (item.email === email)));
    // return the element
    return existingElement;
}

const resolveAsync = async (handler, data, property) => {
    let { updated, existing, checkIfModified } = data;
    // check if the property is modified
    let isModified = await checkIfModified(updated, existing);
    // id modified
    if (isModified) {
        // get the update
        updated = await handler(updated)
    } else {
        // set the property back
        updated[property] = existing[property];
    }
    // return the update
    return updated;
}

const findByToken = ({ id, token }, path) => {
    // get the exisiting elements
    const exisitings = getData(path);
    // find the element
    const element = exisitings.find((existing) => {
        // find the existing token
        const isExistingToken = existing.tokens.find((t) => t.token === token);
        // if found the token exists
        if (existing._id === parseInt(id) && isExistingToken) {
            // return the existing element in the array
            return existing;
        }
    });
    // return the element
    return element;
}

// export the methods in the module
module.exports = {
    ACCOUNTS_PATH,
    STORAGE_PATH,
    EMAIL,
    PASSWORD,
    saveData,
    getData,
    findByProperty,
    isPasswordModified,
    includeInStore,
    findByCredentials,
    findById,
    updateInStore,
    resolveAsync,
    findByToken,
    removeFromStore
};