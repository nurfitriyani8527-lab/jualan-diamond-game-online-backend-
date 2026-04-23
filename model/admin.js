const mongoose = require("mongoose")
const { Schema } = mongoose
const bcrypt = require('bcrypt');
require('dotenv').config()

const adminSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    }
},{
    timestamps: true
})

adminSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        return next()
    }
    const salt = await bcrypt.genSalt(process.env.SALT_ROUNDS)
    this.password = await bcrypt.hash(this.password, salt)
    })
    adminSchema.methods.comparePassword = function (inputPassword){
    return bcrypt.compare(inputPassword, this.password)
    }
 // untuk auto createdAt/updateAt
module.exports = mongoose.model('Admin',adminSchema)