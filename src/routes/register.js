const express = require('express')
const register = require('../controllers/registerController')
const {registerCheck} = require('../middleware/validator')

const router = new express.Router()

router.post('/', registerCheck, register)

module.exports = router