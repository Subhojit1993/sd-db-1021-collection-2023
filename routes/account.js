const express = require('express');
const accountRoutes = express.Router();
const { getData, saveData } = require('../utils/common');
const fs = require('fs');
const dataPath = require('../public/auth.json');
const path = './public/auth.json';

// create account
accountRoutes.post('/sd-db-1021/account/create', (req, res) => {
    // get the exisiting accounts data
    const existingAccounts = getData(path);
    // define and initialize with an unique account id
    const newAccountId = Math.floor(100000 + Math.random() * 900000);
    // set the details in the account
    const account = { ...req.body, _id: newAccountId };
    // push the account into the stack
    existingAccounts.push(account);
    // update the account storage
    saveData(path, existingAccounts);
    // send the success response
    res.send({ success: true, msg: "Account has been created successfully" });
})

// read the accounts
accountRoutes.get('/sd-db-1021/accounts', (_req, res) => {
    // fetch the accounts from the storage
    const accounts = getData(path);
    // send the accounts as response
    res.send(accounts);
})

// update account
accountRoutes.patch('/sd-db-1021/account/:id', (req, res) => {
    // get the existing accounts
    const existingAccounts = getData(path);
    // read the file from the file sytem
    fs.readFile(path, 'utf-8', (_error, _data) => {
        // get the user id from the request params
        const { id } = req.params;
        // set the body obj in the existingAccounts using id
        const existingAccount = existingAccounts.find(account => account._id === parseInt(id));
        // if no data matching the type then send failed response status with the message
        if (existingAccount) return res.status(400).send({ error: true, msg: "Unable to update the account" })
        // get the modified account
        let modifiedAccount = { ...req.body, ...existingAccount };
        // update exisiting accounts
        let updatedExistingAccounts = existingAccounts.map(account => account._id === modifiedAccount._id ? modifiedAccount : account);
        // save account data in the file
        saveData(path, updatedExistingAccounts);
        // account to diplay on response
        const displayResponse = new Object;
        // set display response
        displayResponse[id] = { ...req.body, modified: true };
        // send the response
        res.send(displayResponse);
    }, true);
})

accountRoutes.delete('/sd-db-1021/account/delete/:id', (req, res) => {
    // get the existing accounts
    const existingAccounts = getData(path);
    // read file from the file-system
    fs.readFile(path, 'utf-8', (_error, _data) => {
        // get the user id
        const { id } = req.params;
        // get the existing account
        const deletedAccount = existingAccounts.find(account => account._id === parseInt(id));
        // if no account matches the id then send failure response to the client
        if (deletedAccount) return res.status(400).send({ error: true, msg: "Unable to delete the account" });
        // update exisitng accounts
        let updatedExistingAccounts = existingAccounts.filter(account => account._id !== deletedAccount._id);
        // update the storage
        saveData(path, updatedExistingAccounts);
        // account to diplay on response
        let displayResponse = new Object;
        // set display response
        displayResponse[id] = { ...({ username, email, password } = deletedAccount), deleted: true };
        // send the response
        res.send(displayResponse);
    }, true)
})

module.exports = accountRoutes;