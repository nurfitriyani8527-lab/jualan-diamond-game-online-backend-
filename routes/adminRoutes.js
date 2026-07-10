const adminController = require("../controllers/adminController")
const express = require('express')
const authMiddleware = require("../middleware/authAdmin")
const router = express.Router()
const { loginLimiter, globalLimiter } = require("../middleware/limiter")

router.post("/register", adminController.postRegister)
router.post("/login", loginLimiter,adminController.postLogin)
router.get("/me", authMiddleware, adminController.getLoginMe)

router.get("/order",authMiddleware, adminController.getAdminOrders)
router.get("/order/:_id",authMiddleware, adminController.getAdminOrdersById) // ini dan kebawah masih error
router.put("/order/:_id",authMiddleware,adminController.updateAdminOrders)
router.delete("/order/:_id", authMiddleware, adminController.deleteAdminOrders)

router.get("/product",authMiddleware, adminController.getAdminProducts)
router.post("/product",globalLimiter,authMiddleware, adminController.postAdminProducts)
router.put("/product/:_id",authMiddleware, adminController.updateAdminProducts)
router.delete("/product/:_id",authMiddleware, adminController.deleteAdminProducts)

router.get("/dashboard",authMiddleware, adminController.getAdminDashboard)
router.get("/stats",authMiddleware, adminController.getAdminStats)
router.post("/orderResend/:id",authMiddleware, adminController.postAdminOrdersResend)
router.post("/orderProcess/:id",authMiddleware, adminController.postAdminOrdersProcess)

module.exports = router