const publicController = require("../controllers/publicController")
const express = require('express')
const router = express.Router()

router.get("/products", publicController.getProducts)
router.get("/orders", publicController.getOrders)
router.post("/checkout", publicController.postCheckout)
router.post("/webhook",publicController.postPaymentWebhook)
router.post("/check-nickname", publicController.checkNickname);

module.exports = router