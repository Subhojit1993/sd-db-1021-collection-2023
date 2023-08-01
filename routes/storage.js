const express = require("express");
const storageRoutes = express.Router();
const fs = require("fs");
const { getData, saveData, STORAGE_PATH } = require("../utils/common");
const storageUrl = "/collections/:type/";

storageRoutes.post(storageUrl, (req, res) => {
    const { type } = req.params;
    // get existing data collection
    const existingDataCollection = getData(STORAGE_PATH);
    // get the existing data set fot the specific type
    const newData = [...existingDataCollection[type]];
    // define and initialize unique id
    const newId = Math.floor(100000 + Math.random() * 615000);
    // stucturize the element
    const element = { ...req.body, _id: newId };
    // push the element into the dataset
    newData.push(element);
    // send back the data into the specified type
    existingDataCollection[type] = newData;
    // update the collection storage
    saveData(STORAGE_PATH, existingDataCollection);
    // set the display response
    let displayResponse = element;
    // send the success response
    res.send(displayResponse);
});

storageRoutes.get(storageUrl, (req, res) => {
    const { type } = req.params;
    const { quer } = req.query;
    // get existing data collection// fetch the collection from the storage related to the products
    let existingDataCollection = getData(STORAGE_PATH);
    // get the existing data-set fot the specific type
    let existingCollectionTypeData = [...existingDataCollection[type]];

    // search filter implementation based on query
    if (quer) {
        // filter query
        const query = quer.toLowerCase().replace(/\s/g, '');
        // get the data-object related to the specified type
        existingCollectionTypeData = existingCollectionTypeData.filter((element) =>
            element.name.replace(/\s/g, '').toLowerCase().includes(query)
        );
    }

    // send the response with the collection of specified types
    res.send(existingCollectionTypeData);
});

// Storage update query
storageRoutes.patch(`${storageUrl}:id`, (req, res) => {
    const { id, type } = req.params;
    // get existing data collection
    let existingDataCollection = getData(STORAGE_PATH);
    // read the file from the system
    fs.readFile(STORAGE_PATH, "utf-8", (_error, _data) => {
        // get the existing data-set fot the specific type
        let existingCollectionTypeData = [...existingDataCollection[type]];
        // get the data-object related to the specified type
        let existingData = existingCollectionTypeData.find(
            (element) => element._id === parseInt(id)
        );
        // if no data matching the product then send failed response status with the message
        if (!existingData)
            return res
                .status(400)
                .send({ error: true, msg: `Unable to update the ${type}` });
        // get the modified existing data
        let modifiedExistingData = { ...existingData, ...req.body };
        // map the existing collection data-set related to the specified type
        existingCollectionTypeData = existingCollectionTypeData.map((data) =>
            data._id === existingData._id ? modifiedExistingData : data
        );
        // set back the existing data collection with respect to the specified type
        existingDataCollection[type] = existingCollectionTypeData;
        // save the data
        saveData(STORAGE_PATH, existingDataCollection);
        // set the display response
        let displayResponse = new Object();
        // Initialize the object of type
        displayResponse[type] = new Object();
        // update with modified existing data
        displayResponse[type][id] = modifiedExistingData;
        // send the response to the client
        res.send(displayResponse);
    });
});

// Delete query
storageRoutes.delete(`${storageUrl}:id`, (req, res) => {
    const { id, type } = req.params;
    // get existing data collection
    let existingDataCollection = getData(STORAGE_PATH);
    // read the file from the system
    fs.readFile(STORAGE_PATH, "utf-8", (_error, _data) => {
        // get the existing data-set fot the specific type
        let existingCollectionTypeData = [...existingDataCollection[type]];
        // get the data-object related to the specified type
        let deletedData = existingCollectionTypeData.find(
            (element) => element._id === parseInt(id)
        );

        // if no data matching the product then send failed response status with the message
        if (!deletedData)
            return res
                .status(400)
                .send({ error: true, msg: `Unable to delete the ${type}` });
        // filter collection data
        existingCollectionTypeData = existingCollectionTypeData.filter(
            (element) => element._id !== deletedData._id
        );
        // set back the data collection
        existingDataCollection[type] = existingCollectionTypeData;
        // re-write the data
        saveData(STORAGE_PATH, existingDataCollection);

        // set the display response
        let displayResponse = new Object();
        // Initialize the object of type
        displayResponse[type] = new Object();
        // update with modified existing data
        displayResponse[type][id] = deletedData;
        // send the response to the client
        res.send(displayResponse);
    });
});

module.exports = storageRoutes;
