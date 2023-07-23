const express = require('express');
const bodyParser = require('body-parser');

// create express app
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');

// set middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// import routes
const routes = require('./routes/Routes');
app.use('/', routes);

//start server
app.listen(port, () => {
    console.log(`Server is up on port: ${port}`);
});