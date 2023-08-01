const jwt = require('jsonwebtoken');
const { ACCOUNTS_PATH, findByToken } = require("../utils/common");

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, "thisismynewcourse");
        const user = await findByToken({ id: decoded._id, token }, ACCOUNTS_PATH);

        if (!user) {
            throw new Error()
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: "Unauthorized" })
    }
}

module.exports = auth;