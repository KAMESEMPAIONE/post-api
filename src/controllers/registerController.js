const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')


// @desc Register
// @route POST /register
// @access Public
const register = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const {username, email, password} = req.body
    const duplicateEmail = await User.findOne({ email }).lean().exec()
    const duplicateUser = await User.findOne({ username }).lean().exec()

    if(duplicateEmail) return res.status(409).json({message: 'This email already exists'})
    if(duplicateUser) return res.status(406).json({message: 'This username already exists'})

    try {
        const hashedPwd = await bcrypt.hash(password, 10)
    
        await User.create({
            username,
            email,
            "password": hashedPwd,
        })

        res.status(201).json({ 'success': `New user ${username} created!` });
    } catch(err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = register