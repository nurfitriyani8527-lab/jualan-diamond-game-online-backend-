const respon = require("../utils/response")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Admin = require("../model/admin")
const Product = require("../model/product")
const Order = require("../model/order")
const OrderItem = require("../model/orderItem")
const axios = require("axios")

// POST /admin/login
exports.postRegister = async (req,res) => {
    try {
        const { name, email, password } = req.body
        console.log(req.body)
        if(!name || !email || !password){
            return respon(res,401,false,"data tidak boleh kosong")
        }
        const duplikat = await Admin.findOne({email})
            if(duplikat){
                return respon(res,400,false,"Email sudah terdaftar",duplikat)
            }
        const saveLogin = await Admin.create({
            name,
            email,
            password
        })
        const token = jwt.sign(
            { id: Admin._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
            );
        respon(res,201,true,"berhasil buat akun!",{
            user: saveLogin,
            token
        })
    } catch (error) {
        respon(res,500,false,"ada kesalahan saat register",error.message)
    }
}

// GET /admin/me
exports.getLoginMe = async (req,res) => {
    try {
        const login = await Admin.find()
        if(!login){
            return respon(res,404,false,"data kosong",login)
        }
        respon(res,200,true,"data berhasil dimunculkan",login)
    } catch(error) {
        respon(res,500,false,"gagal mengambil data login",error.message)
    }
}

// GET /admin/orders
// GET /admin/orders?status=pending
// GET /admin/orders?status=paid
exports.getAdminOrders = async (req,res) => {
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

// GET /admin/orders/:id
exports.getAdminOrdersById = async (req,res) => {
    try {
        const _id = req.params
        const order = await Order.findById(_id)
        if(!order){
            return respon(res,404,false,"order kosong",order)
        }
        respon(res,200,true,"data order ditemukan!",order)
    } catch (error) {
        respon(res,500,false,"ada kesalahan saat memunculkan data order",error.message)
    }
}

// PUT /admin/orders/:id
exports.updateAdminOrders = async (req,res) => {
    try {
        const _id = req.params
        const { customer_name, game_id, whatsapp, items } = req.body
        const search = await Order.findById(_id)
        if(!search){
            return respon(res,404,false,"data tidak ditemukan",search)
        }
        const updateData = await Order.updateOne({
            customer_name,
            game_id, 
            whatsapp, 
            items
        })
        respon(res,200,true,"data order berhasil di update",updateData)
    } catch (error) {
        respon(res,500,false,"ada kesalahan saat update data")
    }
}

// DELETE /admin/orders/:id
exports.deleteAdminOrders = async (req,res) => {
    try {
        const _id = req.params
        const hapus = await Order.findByIdAndDelete(_id)
        if(!hapus){
            return respon(res,404,false,"data tidak ditemukan",hapus)
        }
        respon(res,200,true,"data berhasil dihapus",hapus)
    } catch (error) {
        respon(res,500,false,"error saat menghapus order")
    }
}

// POST /admin/products
exports.postAdminProducts = async (req,res) => {
    try {
        const { name, game, price } = req.body
        if(!name || !game || !price){
            return respon(res,401,false,"data tidak boleh kosong")
        }
        const saveProduct = await Product.create({
            name,
            game,
            price
        })
        respon(res,201,true,"product berhasil dibuat",saveProduct)
    } catch (error) {
        respon(res,500,false,"gagal membuat product",error.message)
    }
}

// PUT /admin/products/:id
exports.updateAdminProducts = async (req,res) => {
    try {
        const _id = req.params
        const { name, game, price } = req.body
        const search = await Product.findById(_id)
        if(!search){
            return respon(res,404,false,"data product tidak ditemukan",search)
        }
        const updateData = await Product.updateOne({
            name,
            game,
            price
        })
        respon(res,200,true,"data product berhasil di update",updateData)
    } catch (error) {
        respon(res,500,false,"terjadi kesalahan saat update data",error.message)
    }
}

// DELETE /admin/products/:id
exports.deleteAdminProducts = async (req,res) => {
    try {
        const _id = req.params
        const hapus = await Product.findByIdAndDelete(_id)
        if(!hapus){
            return respon(res,404,false,"data tidak ditemukan",hapus)
        }
        respon(res,200,true,"data berhasil di hapus",hapus)
    } catch (error) {
        respon(res,500,false,"ada kesalahan saat menghapus data")
    }
}

// GET /admin/products
exports.getAdminProducts = async (req,res) => {
    try {
        const product = await Product.find()
        if(!product){
            return respon(res,404,false,"data tidak ditemukan",product)
        }
        respon(res,200,true,"berhasil memunculkan data",product)
    } catch (error) {
        respon(res,500,false,"gagal memunculkan data",error.message)
    }
}

// GET /admin/dashboard
exports.getAdminDashboard = async (req,res) => {
    try {
    const totalOrders = await Order.countDocuments();

    const totalRevenueData = await Order.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: "$total_price" } } }
    ]);

    const totalRevenue = totalRevenueData[0]?.total || 0;

    const pending = await Order.countDocuments({ status: 'pending' });
    const paid = await Order.countDocuments({ status: 'paid' });
    const failed = await Order.countDocuments({ status: 'failed' });

    res.json({
        total_orders: totalOrders,
        total_revenue: totalRevenue,
        pending,
        paid,
        failed
    });

    } catch (error) {
        respon(res,500,false,"server error",error.message)
    }
};

// GET /admin/stats?range=7days
// GET /admin/stats?range=30days
exports.getAdminStats = async (req,res) => {
    try {
        const { range } = req.query;
        let days = 7;
        if (range === '30days') days = 30;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const stats = await Order.aggregate([
        {
        $match: {
            createdAt: { $gte: startDate },
            status: { $in: ['paid', 'done'] }
        }
        },
        {
        $group: {
            _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" }
            },
            total: { $sum: "$total_price" },
            count: { $sum: 1 }
        }
        },
        {$sort: { "_id.month": 1, "_id.day": 1 }}
    ]);

    res.json(stats);

    } catch (error) {
    respon(res,500,false,"admin stats erorr")
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

// POST /admin/orders/:id/resend-notif
exports.postAdminOrdersResend = async (req,res) => {
    try {
        const _id = req.params._id
        const order = await Order.findById(_id)
        
        if(!order){
            return respon(res,404,false,"order tidak ditemukan")
        }

        const bot = await sendTelegramNotification(`
            ${order.customer_name}
            ID: ${order.game_id}
            ${order.whatsapp}

            Rp${order.total_price}
            Status: ${order.status}

            ${order.midtrans_order_id}
            `)

        respon(res,200,true,"notif telegram berhasil dikirim ulang",bot)
    } catch (error) {
        respon(res,500,false,"order resend error",error.message)
    }
}

// POST /admin/orders/:id/process
exports.postAdminOrdersProcess = async (req,res) => {
    try {
        const _id = req.params._id
        const order = await Order.findById(_id)

        if(!order){
            return respon(res,404,false,"order tidak ditemukan")
        }
        if(order.status !== "paid"){
            return respon(res,400,false,"order belum dibayar")
        }

        order.status = "done"
        await Order.save()

        const bot = await sendTelegramNotification(`
            ${order.customer_name}
            ID: ${order.game_id}
            ${order.whatsapp}

            Rp${order.total_price}

            ${order.midtrans_order_id}
            `)

        respon(res,200,true,"order berhasil diselesaikan",bot)
    } catch (error) {
        respon(res,500,false,"order process error",error.message)
    }
}