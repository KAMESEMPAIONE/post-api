const rateLimit = require('express-rate-limit')

const loginLimitter = rateLimit({
    windowsMs: 60 * 1000,
    max: 5,
    message: {message: 'Too many attempts, try again after 60 seconds!'}
})

const registerLimitter = rateLimit({
    windowsMs: 5 * 60 * 1000,
    max: 3
})

module.exports =  {
    loginLimitter,
    registerLimitter
}