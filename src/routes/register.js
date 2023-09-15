const express = require('express')
const register = require('../controllers/registerController')
const { registerCheck } = require('../middleware/validator')
const { registerLimitter } = require('../middleware/limitter')
const router = new express.Router()

router.post('/', registerCheck, registerLimitter, register)

module.exports = router