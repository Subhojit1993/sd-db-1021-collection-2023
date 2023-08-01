const express = require('express');
const fs = require('fs');
const accountRoutes = express.Router();
const {
    getData,
    saveData,
    ACCOUNTS_PATH,
    isPasswordModified,
    PASSWORD,
    includeInStore,
    findById,
    findByCredentials,
    updateInStore,
    resolveAsync,
    removeFromStore
} = require('../utils/common');
const {
    permission,
    trimmedContent,
    encrypt
} = require('../validations/auth');
const { generateAuthToken } = require('../utils/auth');
const auth = require("../middleware/auth");

// create account
accountRoutes.post('/sd-db-1021/account/create', async (req, res) => {
    const { body } = req;
    // get the status of account validation
    const isValidAccount = permission(body);
    // If not a valid account
    if (isValidAccount.error) return res.status(400).send(isValidAccount);
    // get the trimmed body
    const trimmedRequestBody = trimmedContent(body);
    // define and initialize with an unique account id
    const newAccountId = Math.floor(100000 + Math.random() * 900000);
    // set the details in the account
    const user = await encrypt({ ...trimmedRequestBody, _id: newAccountId });
    // generate authetication token and keep it with user
    const authenticatedUser = await generateAuthToken({ user });
    // update the store
    includeInStore(authenticatedUser, ACCOUNTS_PATH);
    // hide password encryption
    delete user.password;
    // store in req
    req.user = user;
    // send the success response
    res.status(201).send({ success: true, user, msg: "Account has been created successfully" });
})

// login
accountRoutes.post('/sd-db-1021/account/login/', async (req, res) => {
    const { username, email, password } = req.body;
    const element = { username, email };
    // check if user exists
    // get the user
    const user = findByCredentials(element, ACCOUNTS_PATH);
    // if user doesn't exist
    if (!user) return res.status(400).send({ error: true, msg: "User does't exist" });
    // generate authentication token and keep it with the user
    const authenticatedUser = await generateAuthToken({ user });
    // check if password matches
    const noPasswordMatch = await isPasswordModified({ password }, authenticatedUser);
    // if user account is found
    if (!noPasswordMatch) {
        // save in store
        updateInStore(authenticatedUser, ACCOUNTS_PATH);
        // send success response
        res.send({
            success: true,
            msg: `successfully logged in!`,
            user: authenticatedUser
        })
    } else {
        // if not, send error response
        return res.status(400).send({
            error: true,
            msg: `Account credentials are invalid!`
        });
    }
})

accountRoutes.post('/sd-db-1021/account/logout/', auth, async (req, res) => {
    try {
        console.log("users", req.user, req.token);
        // unauthenticate the user
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        updateInStore(req.user, ACCOUNTS_PATH);
        res.send({ loggedOut: true });
    } catch (error) {
        res.status(500).send();
    }
})

// read the accounts
accountRoutes.get('/sd-db-1021/accounts', auth, (_req, res) => {
    // fetch the accounts from the storage
    const accounts = getData(ACCOUNTS_PATH);
    // send the accounts as response
    res.send(accounts);
})

// update account
accountRoutes.patch('/sd-db-1021/account/:id', auth, (req, res) => {
    // get the user id and body from the request params
    const { id } = req.params;
    const { body } = req;
    // initialize update permission
    const updatePermission = true;
    // get the user account
    const existing = findById({ id }, ACCOUNTS_PATH);
    // read the file from the file sytem
    fs.readFile(ACCOUNTS_PATH, 'utf-8', async (_error, _data) => {
        // if no data matching the type then send failed response status with the message
        if (!existing) return res.status(400).send({ error: true, msg: "Unable to update the account" })
        // get the status of account validation
        const validation = permission(body, updatePermission);
        // get the trimmed body
        let updated = trimmedContent(body);
        // If not a valid account
        if (validation.error) return res.status(400).send(validation);
        // get the updated
        let userAccount = await resolveAsync(encrypt, { updated, existing, checkIfModified: isPasswordModified }, PASSWORD);
        // get the spread updated account
        let updatedUserAccount = { ...existing, ...userAccount };
        // update exisiting accounts with the updated account
        updateInStore(updatedUserAccount, ACCOUNTS_PATH);
        // account to diplay on response
        const displayedUserAccount = new Object;
        // set display response
        displayedUserAccount[id] = { ...updatedUserAccount, modified: true };
        // send the response
        res.send(displayedUserAccount);
    }, true);
})

accountRoutes.delete('/sd-db-1021/account/delete/:id', auth, (req, res) => {
    // read file from the file-system
    fs.readFile(ACCOUNTS_PATH, 'utf-8', (_error, _data) => {
        // get the user id
        const { id } = req.params;
        // get the existing account
        const deletedAccount = findById({ id }, ACCOUNTS_PATH);
        // if no account matches the id then send failure response to the client
        if (!deletedAccount) return res.status(400).send({ error: true, msg: "Unable to delete the account" });
        // else remove from store
        removeFromStore(deletedAccount, ACCOUNTS_PATH);
        // account to diplay on response
        let displayResponse = new Object;
        // set display response
        displayResponse[id] = { ...({ username, email } = deletedAccount), deleted: true };
        // send the response
        res.send(displayResponse);
    }, true)
})

module.exports = accountRoutes;