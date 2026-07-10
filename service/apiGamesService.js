require('dotenv').config()

async function checkNickname(userId) {
    const merchantId = process.env.APIGAMES_MERCHANT_ID;
    const signature = generateApiGamesSignature();

    const url = `https://v1.apigames.id/merchant/${merchantId}/cek-username/mobilelegend`;

    const response = await axios.get(url, {
        params: {
            user_id: userId,
            signature
        }
    });

    const result = response.data;

    if (!result.data.is_valid) {
        return null;
    }

    return result.data.username;
}

module.exports = {checkNickname}