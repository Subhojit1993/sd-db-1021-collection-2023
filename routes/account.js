const express = require('express');
const accountRoutes = express.Router();
const { getData, saveData } = require('../utils/common');
const fs = require('fs');
const { accountsPath, isPasswordModified, PASSWORD } = require("../utils/common");
const { permission, trimmedContent, encrypt } = require('../validations/auth');

// create account
accountRoutes.post('/sd-db-1021/account/create', async (req, res) => {
    const { body } = req;
    // get the status of account validation
    const validAccount = permission(body);
    // get the trimmed body
    const trimmedRequestBody = trimmedContent(body);
    // If not a valid account
    if (validAccount.error) return res.status(400).send(validAccount);
    // get the exisiting accounts data
    const existingAccounts = getData(accountsPath);
    // define and initialize with an unique account id
    const newAccountId = Math.floor(100000 + Math.random() * 900000);
    // set the details in the account
    const account = await encrypt({ ...trimmedRequestBody, _id: newAccountId });
    // push the account into the stack
    existingAccounts.push(account);
    // update the account storage
    saveData(accountsPath, existingAccounts);
    // send the success response
    res.send({ success: true, msg: "Account has been created successfully" });
})

// read the accounts
accountRoutes.get('/sd-db-1021/accounts', (_req, res) => {
    // fetch the accounts from the storage
    const accounts = getData(accountsPath);
    // send the accounts as response
    res.send(accounts);
})

// update account
accountRoutes.patch('/sd-db-1021/account/:id', (req, res) => {
    const updatePermission = true;
    // get the exisiting accounts
    const existingUserAccounts = getData(accountsPath);
    // read the file from the file sytem
    fs.readFile(accountsPath, 'utf-8', async (_error, _data) => {
        // get the user id and body from the request params
        const { id } = req.params;
        const { body } = req;
        // set the body obj in the existing user Accounts using id
        const existingUserAccount = existingUserAccounts.find(account => account._id === parseInt(id));
        // if no data matching the type then send failed response status with the message
        if (!existingUserAccount) return res.status(400).send({ error: true, msg: "Unable to update the account" })
        // get the status of account validation
        const validation = permission(body, updatePermission);
        // get the trimmed body
        let userAccount = trimmedContent(body);
        // If not a valid account
        if (validation.error) return res.status(400).send(validation);
        // check if the password is modified
        let passwordModified = await isPasswordModified(userAccount, existingUserAccount);
        // if password is modified
        if (passwordModified) {
            // trigger encryption
            userAccount = await encrypt(userAccount);
        } else {
            // set the existing user account password in the updated account
            userAccount[PASSWORD] = existingUserAccount[PASSWORD];
        }
        // derive the updated account
        let updatedUserAccount = { ...existingUserAccount, ...userAccount };
        // update exisiting accounts with the updated account
        let updatedAccounts = existingUserAccounts.map(account => account._id === updatedUserAccount._id ? updatedUserAccount : account);
        // save account data in the file
        saveData(accountsPath, updatedAccounts);
        // account to diplay on response
        const displayedUserAccount = new Object;
        // set display response
        displayedUserAccount[id] = { ...updatedUserAccount, modified: true };
        // send the response
        res.send(displayedUserAccount);
    }, true);
})

accountRoutes.delete('/sd-db-1021/account/delete/:id', (req, res) => {
    // get the existing accounts
    const existingAccounts = getData(accountsPath);
    // read file from the file-system
    fs.readFile(accountsPath, 'utf-8', (_error, _data) => {
        // get the user id
        const { id } = req.params;
        // get the existing account
        const deletedAccount = existingAccounts.find(account => account._id === parseInt(id));
        // if no account matches the id then send failure response to the client
        if (deletedAccount) return res.status(400).send({ error: true, msg: "Unable to delete the account" });
        // update exisitng accounts
        let updatedExistingAccounts = existingAccounts.filter(account => account._id !== deletedAccount._id);
        // update the storage
        saveData(accountsPath, updatedExistingAccounts);
        // account to diplay on response
        let displayResponse = new Object;
        // set display response
        displayResponse[id] = { ...({ username, email, password } = deletedAccount), deleted: true };
        // send the response
        res.send(displayResponse);
    }, true)
})

module.exports = accountRoutes;