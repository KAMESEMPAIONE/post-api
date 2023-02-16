const {check} = require('express-validator')

const registerCheck = [
    check('username')
        .trim()
        .isLength({min:3}).withMessage('Username is to short!')
        .isLength({max:32}).withMessage('Username is to long!')
        .escape(),

    check('email')
        .trim()
        .isLength({min:8, max:32})
        .isEmail().withMessage('Email not valid!')
        .escape(),
    
    check('password')
        .trim()
        .isLength({min:8}).withMessage('Password is to short!')
        .isLength({max:32}).withMessage('Password is to long!')
]

const updateCredentialsCheck = [
    check('newUsername')
        .if(check('newUsername').exists())
        .trim()
        .isLength({min:3}).withMessage('Username is to short!')
        .isLength({max:32}).withMessage('Username is to long!')
        .escape(),
    
    check('newPassword')
        .if(check('newPassword').exists())
        .trim()
        .isLength({min:8}).withMessage('Password is to short!')
        .isLength({max:32}).withMessage('Password is to long!')
]

module.exports = {
    registerCheck,
    updateCredentialsCheck
}