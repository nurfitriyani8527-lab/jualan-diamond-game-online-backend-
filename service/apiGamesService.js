const {generateApiGamesSignature} = require("../utils/signature") 
const axios = require ("axios")
require('dotenv').config()

async function checkNickname(gameCode,userId) {
    const merchantId = process.env.APIGAMES_MERCHANT_ID;
    const signature = generateApiGamesSignature()

    const url = `https://v1.apigames.id/merchant/${merchantId}/cek-username/${gameCode}`;

    const response = await axios.get(url, {
        params: {
            user_id: userId,
            signature
        }
    });
    const result = response.data;

    console.log(result);

    if (!result.data) {
        throw new Error(result.message);
    }

    if (!result.data.is_valid) {
        return null;
    }

    return result.data.username;
}

module.exports = {checkNickname}