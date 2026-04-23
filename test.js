const axios = require('axios');

const TELEGRAM_BOT_TOKEN = '8343429947:AAF3CsO2A3efQ-jNFp2XR4zc9yQegWcCjoA';
const TELEGRAM_CHAT_ID = '7957300337';

axios.post(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
        chat_id: TELEGRAM_CHAT_ID,
        text: '✅ Bot Telegram berhasil ditest!',
        parse_mode: 'Markdown'
    }
).then(res => console.log('Sukses:', res.data))
 .catch(err => console.log('Error:', err.response?.data || err.message));