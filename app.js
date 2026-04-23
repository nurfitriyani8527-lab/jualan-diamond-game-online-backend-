const express = require('express')
const app = express()
const port = 3000
const {connectDB} = require("./config/databse")
const publicRoutes = require("./routes/publicRoutes")
const adminRoutes = require("./routes/adminRoutes") 

app.use(express.json())

connectDB()

app.use('/public', publicRoutes)
app.use('/admin', adminRoutes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
