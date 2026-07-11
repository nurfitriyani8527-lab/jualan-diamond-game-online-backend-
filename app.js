require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT
const cors = require("cors")
const {connectDB} = require("./config/databse")
const publicRoutes = require("./routes/publicRoutes")
const adminRoutes = require("./routes/adminRoutes") 
const helmet = require("helmet")
const { globalLimiter } = require("./middleware/limiter")

connectDB()

app.use(cors({
  origin: 'http://localhost:5173', // bisa dari react dan kalau udah di hosting taruh url nya disini
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({
  limit: "10mb"
}))

app.use(globalLimiter)
app.use(helmet())
app.use('/public', publicRoutes)
app.use('/admin', adminRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
