const crypto = require("crypto"); // signature untuk apigames
require('dotenv').config()

function generateApiGamesSignature() {
    return crypto
        .createHash("md5")
        .update(
            process.env.APIGAMES_MERCHANT_ID +
            process.env.APIGAMES_SECRET_KEY
        )
        .digest("hex");
}

module.exports = {
    generateApiGamesSignature
};