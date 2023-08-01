const jwt = require('jsonwebtoken');

const generateAuthToken = async (data) => {
    const { user } = data;

    // pass the payload and secret
    const token = jwt.sign({ _id: user._id.toString() }, "thisismynewcourse");
    // define and initialize with an unique account id
    const _id = Math.floor(300000 + Math.random() * 700000);

    if (!user.tokens) {
        let tokens = [];
        tokens.push({ token, _id })
        user.tokens = tokens;
    }
    else {
        user.tokens = user.tokens.concat({ token, _id })
    };
    user.token = token;
    return user;
}

module.exports = { generateAuthToken };