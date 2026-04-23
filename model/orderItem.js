const mongoose = require("mongoose")
const { Schema } = mongoose
const Product = require("../model/product")

const orderItemSchema = new Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Product
    },
    name: {
        type: String,
        ref: Product
    },
    price: {
        type: Number,
        ref: Product
    },
    qty: {
        type: Number
    }
},{
    timestamps: true
})

module.exports = mongoose.model('OrderItem',orderItemSchema)