const respon = require("../utils/response")
const Product = require("../model/product")
const Order = require("../model/order")
const OrderItem = require("../model/orderItem")
const Contact = require("../model/contact")
const midtransClient = require("midtrans-client")
const { checkNickname } = require("../service/apiGamesService")
const axios = require("axios")
require('dotenv').config()

// setup midtrans
const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// GET /products
// GET /products?game=ff
// GET /products?game=ml
exports.getProducts = async (req,res) => {
    try {
        const { game } = req.query
        let product
        if(game){
            product = await Product.find({
            game: { $regex: game.toLowerCase(), $options: "i" }
            })
        }else{
            product = await Product.find()
        }
        respon(res,200,true,"data game berhasil ditemukan!",product)
    } catch (error) {
        return respon(res,500,false,"gagal menemukan data game",error.message)
    }
} // selesai

exports.getOrders = async (req, res) => {
    try {
        const { status, whatsapp } = req.query  // ← tambah whatsapp
        let filter = {}

        if (status) {
            filter.status = { $regex: status, $options: "i" }
        }

    if (whatsapp) {
      filter.whatsapp = whatsapp  // ← tambah kondisi ini
    }

    const order = await Order.find(filter)
    respon(res, 200, true, "data status berhasil di temukan", order)
    } catch (error) {
        return respon(res, 500, false, "gagal menemukan data status", error.message)
    }
}

exports.postCheckout = async (req,res) => {
    try {
        const { customer_name, game_id, whatsapp, items } = req.body
        if (!customer_name || !game_id || !whatsapp || !items.length) {
            return respon(res,400,false,"data tidak lengkap")
        }

        let total = 0;
        let orderItems = [];
        
        for (let item of items){
            const product = await Product.findById(item.product_id)
        
        if(!product){
            return respon(res,404,false,"Product tidak ditemukan",product)
        }
        const subtotal = product.price * item.qty
        total += subtotal

        orderItems.push({
            product_id: product._id,
            name: product.name,
            price: product.price,
            qty: item.qty
        })
        }
        const orderId = "ORDER" + Date.now()

        const order = await Order.create({
            customer_name,
            game_id,
            whatsapp,
            item: orderItems,
            total_price: total,
            status: "pending",
            midtrans_order_id: orderId
        })

        const transaction = await snap.createTransaction({
            transaction_details: {
                order_id: orderId,
                gross_amount: total,
            },
            item_details: orderItems.map(item => ({
                id: item.product_id.toString(),
                price: item.price,
                quantity: item.qty,
                name: item.name
            })),
            customer_details:{
                first_name: customer_name,
                phone: whatsapp,
            },
        })
        res.json({
            message: 'Checkout berhasil',
            token: transaction.token,
            redirect_url: transaction.redirect_url,
            order_id: orderId,
    })
    } catch (error) {
        respon(res,500,false,"server error",error.message)
    }
}

exports.postContact = async (req,res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return respon(res,400,false,"semua field wajib diisi")
        }

        // Simpan ke database
        const contact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        await sendTelegramNotification(`
            📨 *CONTACT BARU*

            ━━━━━━━━━━━━━━

            👤 *Nama*
            ${name}

            📧 *Email*
            ${email}

            📝 *Subjek*
            ${subject}

            💬 *Pesan*
            ${message}

            ━━━━━━━━━━━━━━
            🕒 ${new Date().toLocaleString("id-ID")}
        `);

        return respon(res,201,true,"pesan berhasil dikirim ke admin",contact)

    } catch (error) {
        return respon(res,500,false,"terjadi kesalahan pada server",error.message)
    }
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

async function sendTelegramNotification(message){
    try {
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,{
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown"
        })
        console.log("Telegram notification sent")
    } catch (error) {
        console.error("telegram error", error.message)
    }
}

exports.postPaymentWebhook = async (req, res) => {
    try {
        const { order_id, transaction_status, fraud_status } = req.body;

        // Cari order
        const order = await Order.findOne({
            midtrans_order_id: order_id,
        });

        if (!order) {
            return respon(res, 404, false, "Order tidak ditemukan");
        }

        // Tentukan status
        if (
            transaction_status === "capture" &&
            fraud_status === "accept"
        ) {
            order.status = "paid";
        } else if (transaction_status === "settlement") {
            order.status = "paid";
        } else if (transaction_status === "pending") {
            order.status = "pending";
        } else if (
            transaction_status === "deny" ||
            transaction_status === "cancel" ||
            transaction_status === "expire"
        ) {
            order.status = "failed";
        }

        await order.save();

        // Kirim Telegram hanya jika pembayaran berhasil
        if (order.status === "paid") {
            const notificationMessage = `
✅ *PEMBAYARAN BERHASIL*

━━━━━━━━━━━━━━

👤 *Nama*
${order.customer_name}

🎮 *Game ID*
${order.game_id}

📱 *WhatsApp*
${order.whatsapp}

💰 *Total*
Rp ${order.total_price.toLocaleString("id-ID")}

🆔 *Order ID*
${order.midtrans_order_id}

📌 *Status*
${order.status.toUpperCase()}

🕒 ${new Date().toLocaleString("id-ID")}

━━━━━━━━━━━━━━
`;

            await sendTelegramNotification(notificationMessage);
        }

        return respon(
            res,
            200,
            true,
            "Webhook berhasil diproses",
            order
        );

    } catch (error) {
        console.error(error);

        return respon(
            res,
            500,
            false,
            "Terjadi kesalahan pada server",
            error.message
        );
    }
};

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
