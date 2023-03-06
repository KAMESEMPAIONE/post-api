const express = require('express')
const authController = require('../controllers/authController')
const loginLimitter = require('../middleware/loginLimitter')
const {updateCredentialsCheck} = require('../middleware/validator')
const verifyJWT = require('../middleware/verifyJWT')

const router = new express.Router()

router.post('/', loginLimitter, authController.login)
router.post('/logout', authController.logout)
router.get('/refresh', authController.refreshToken)
router.patch('/update', verifyJWT, updateCredentialsCheck, authController.updateCredentials)

module.exports = router