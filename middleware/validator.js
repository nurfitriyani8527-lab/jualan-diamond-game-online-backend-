const { body, validationResult } = require("express-validator");

const checkoutValidation = [

    body("customer_name")
        .trim()
        .notEmpty()
        .withMessage("Nama wajib diisi")
        .isLength({ min: 3, max: 50 })
        .withMessage("Nama harus 3-50 karakter"),

    body("game_id")
        .trim()
        .notEmpty()
        .withMessage("Game ID wajib diisi")
        .isNumeric()
        .withMessage("Game ID hanya boleh angka"),

    body("whatsapp")
        .trim()
        .notEmpty()
        .withMessage("WhatsApp wajib diisi")
        .isMobilePhone("id-ID") // memastikan nomor whatsapp disini punya indonesia
        .withMessage("Nomor WhatsApp tidak valid"),

    body("items")
        .isArray({ min: 1 })
        .withMessage("Minimal pilih satu produk"),

];

const loginValidation = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("email wajib diisi")
        .isEmail()
        .withMessage("email tidak valid"),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("password wajib diisi")
        .isLength({min: 8})
]


const validate = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return res.status(400).json({
            success: false,
            errors: errors.array()
        });

    }

    next();

};

module.exports = {
    checkoutValidation,
    loginValidation,
    validate
};