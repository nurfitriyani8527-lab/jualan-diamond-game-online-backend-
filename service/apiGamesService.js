const {generateApiGamesSignature} = require("../utils/signature") 
const axios = require ("axios")
require('dotenv').config()

async function checkNickname(gameCode, userId) {
    const merchantId = process.env.APIGAMES_MERCHANT_ID;
    const signature = generateApiGamesSignature();

    // mapping gameCode internal -> endpoint apigames
    const endpointMap = {
        ml: "mobilelegend",
        ff: "freefire",
    };

    const endpoint = endpointMap[gameCode];
    if (!endpoint) {
        throw new Error("Game tidak didukung");
    }

    const url = `https://v1.apigames.id/merchant/${merchantId}/cek-username/${endpoint}`;

    const response = await axios.get(url, {
        params: { user_id: userId, signature }
    });
    const result = response.data;

    if (!result.data) {
        throw new Error(result.message);
    }
    if (!result.data.is_valid) {
        return null;
    }
    return result.data.username;
}

module.exports = {checkNickname}