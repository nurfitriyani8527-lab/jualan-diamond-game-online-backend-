const { generateApiGamesSignature } = require("../utils/signature");
const axios = require("axios")
const respon = require("../utils/response")
require('dotenv').config()

async function checkNickname(userId) {
    try {
        const merchantId = process.env.APIGAMES_MERCHANT_ID;
        const signature = generateApiGamesSignature();

        const url = `https://v1.apigames.id/merchant/${merchantId}/cek-username/mobilelegend`;

        const response = await axios.get(url, {
            params: {
                user_id: userId,
                signature: signature
            }
        });

        const result = response.data;

        if (!result.data.is_valid) {
            respon(res,404,false,"data nickname tidak ditemukan")
        }

        return result.data.username;
        respon(res,200,true,"nickname berhasil ditemukan",error.message)
    } catch (error) {
        respon(res,500,false,"tidak dapat menghubungi apigames",error.message)
    }
}

module.exports = {checkNickname}