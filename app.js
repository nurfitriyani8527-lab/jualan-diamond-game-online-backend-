const express = require('express')
const app = express()
const port = process.env.PORT
const cors = require("cors")
const {connectDB} = require("./config/databse")
const publicRoutes = require("./routes/publicRoutes")
const adminRoutes = require("./routes/adminRoutes") 
require('dotenv').config()

app.use(cors({
  origin: '*', // Bisa dari mana saja
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json())

connectDB()

app.use('/public', publicRoutes)
app.use('/admin', adminRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
