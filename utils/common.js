const fs = require('fs');

// util functions

// save data
const saveData = (dataPath, data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync(dataPath, stringifyData)
}

// read data
const getData = (dataPath) => {
    const jsonData = fs.readFileSync(dataPath)
    const jsonDataBuffer = jsonData.toString();
    return JSON.parse(jsonDataBuffer);
}

module.exports = { saveData, getData };