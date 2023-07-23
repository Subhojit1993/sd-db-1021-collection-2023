const express = require('express');
const router = express.Router();
const fs = require('fs');

// import account routes
const accountRoutes = require('./account');

// import product routes
const storageRoutes = require('./storage');

router.use(accountRoutes);
router.use(storageRoutes);



module.exports = router;