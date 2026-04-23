const respon = require("../utils/response")
const Product = require("../model/product")
const Order = require("../model/order")
const OrderItem = require("../model/orderItem")
const midtransClient = require("midtrans-client")
const axios = require("axios")
require('dotenv').config()

// setup midtrans
const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION,
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

exports.getOrders = async (req,res) => {
    try {
        const { status } = req.query
        let order
        if(status){
            order = await Order.find({
            status: { $regex: status, $options: "i" }
            })
        }else{
            order = await Order.find()
        }
        respon(res,200,true,"data status berhasil di temukan",order)
    } catch (error) {
        return respon(res,500,false,"gagal menemukan data status",error.message)
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
            items_details: orderItems.map(item => ({
                id: item.product_id.toString(),
                price: item.price,
                quantity: item.qty,
                name: item.name
            })),
            customer_detail:{
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

exports.postPaymentWebhook = async (req,res) => {
    try {
        const { order_id, transaction_status, fraud_status } = req.body
        const notificationMessage = `
            Order ID: ${order_id}
            Status: ${transaction_status}
            Fraud Check: ${fraud_status}
            Waktu: ${new Date().toLocaleString("id-ID")}
            `
        sendTelegramNotification(notificationMessage)
        respon(res,200,true,"berhasil mengirim notifikasi")
    } catch (error) {
        respon(res,500,false,"ada kesalahan",error.message)
    }
}










// const getFilmsById = async (req,res) => {
//     try {
//         const _id = req.params
//         const search = await Film.findById(_id)
//         if(!search){
//             respon(res,404,false,"id film tidak ditemukan!",search)
//         }
//         respon(res,201,true,"id film berhasil ditemukan!",search)
//     } catch (error) {
//         return respon(res,500,false,"gagal menemukan id film",error.message)
//     }
// }

// const postFilms = async (req,res) => {
//     try{
//         const { judul, rating, deskripsi } = req.body
//         const errors = validationResult(req)
//         if(!errors.isEmpty()){
//             respon(res, 422, false,errors.array())
//         }
//         const saveFilms = await Film.create({
//             judul,
//             rating,
//             deskripsi
//         });
//         respon(res,201,true,"berhasil menambahkan rating baru",saveFilms)
//     } catch (error) {
//         respon(res,500,false,"gagal menambahkan rating baru",error.message)
//     }
// }

// const updateFilms = async (req,res) => {
//     try {
//         const _id = req.params._id
//         console.log(req.params)
//         const { judul, rating, deskripsi } = req.body
//         if(!_id){
//             respon(res,404,false,`film dengan id ${_id} tidak ditemukan`,_id)
//         }
//         const update = await Film.findByIdAndUpdate(_id,{
//             judul,
//             rating,
//             deskripsi
//         })
//         respon(res,201,true,`film dengan id ${_id} berhasil di update`,update)
//     } catch (error) {
//         respon(res,500,false,"gagal mengupdate film",error.message)
//     }
// }

// const deleteFilms = async (req,res) => {
//     try {
//         const _id = req.params._id
//         const hapus = await Film.findByIdAndDelete(_id)
//         if(!hapus){
//             respon(res,404,false,`film dengan id ${_id} tidak ditemukan`,hapus)
//         }
//         respon(res,201,true,`film dengan id ${_id} berhasil dihapus`,hapus)
//     } catch (error) {
//         respon(res,500,false,"gagal menghapus film",error.message)
//     }
// }

// module.exports = { getFilms, getFilmsById, postFilms, updateFilms, deleteFilms }
