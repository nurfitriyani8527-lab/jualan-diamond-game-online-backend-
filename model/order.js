const mongoose = require("mongoose")
const { Schema } = mongoose

const orderSchema = new Schema({
    customer_name: {
        type: String,
        required: true
    },
    game_id: {
        type: Number,
        required: true,
        unique: true
    },
    whatsapp: {
        type: Number,
        required: true
    },
    items: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        name: {
            type: String
        },
        price: {
            type: Number
        },
        qty: {
            type: Number
        }
    }],
    total_price: {
        type: Number,
    },
    status: {
        type: String,
        default: 'pending'
    },
    midtrans_order_id: {
        type: String
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Order',orderSchema)