const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { validationResult } = require('express-validator')

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
    const cookies = req.cookies
    const {username, password} = req.body
    if(!username || !password) return res.status(400).json({ message: 'Username and password are required!' })

    const foundUser = await User.findOne({ username }).exec()
    if(!foundUser) return res.sendStatus(401)

    const match = await bcrypt.compare(password, foundUser.password)
    
    if(!match) return res.sendStatus(401)
    
    const accessToken = jwt.sign(
        {id: foundUser._id, username, roles: foundUser.roles},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '5m'}
    )
        
    const newRefreshToken = jwt.sign(
        {id: foundUser._id},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '15m'}
    )

    let refreshTokenArr = 
        !cookies?.jwt 
            ? foundUser.refreshToken
            : foundUser.refreshToken.filter(rt => rt !== cookies.jwt)
        
    if(cookies?.jwt) {
        const refreshToken = cookies.jwt
        const foundToken = await User.findOne({refreshToken}).exec()

        if(!foundToken) {
            refreshTokenArr = []
        }

        res.clearCookie('jwt', {httpOnly:true})
    }
       

    foundUser.refreshToken = [...refreshTokenArr, newRefreshToken]
    await foundUser.save()

    res.cookie('jwt', newRefreshToken, {httpOnly:true, maxAge: 15 * 60 * 1000})
    res.json({accessToken})
}

// @desc Logout
// @route POST /auth/logout
// @access Public 
const logout = async (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204)

    const refreshToken = cookies.jwt
    res.clearCookie('jwt', { httpOnly: true})

    const foundUser = await User.findOne({ refreshToken }).exec()
    if (!foundUser) return res.sendStatus(204)

    foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken)
    await foundUser.save()
  
    res.sendStatus(204)
}

// @desc Update Credentials
// @route PATCH /auth/update
// @access Private
const updateCredentials = async (req, res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const username = req.user
    const id = req.userId

    const { password, newUsername, newPassword} = req.body
    if(!password) return res.status(400).json({ message: 'Password are required.' })
    if(!newUsername && !newPassword) return res.status(400).json({ message: 'Must be a new username or a new password' })

    const foundUser = await User.findOne({ username }).exec()
    if(!foundUser) return res.sendStatus(401)

    const match = await bcrypt.compare(password, foundUser.password)
    if(!match) return res.sendStatus(401)

    try {
        if(newUsername) {
            const duplicate = await User.findOne({ username: newUsername }).lean().exec()
        
            if(duplicate && duplicate?._id.toString() !== id) {
                return res.status(409).json({ message: 'Duplicate username' })
            }

            foundUser.username = newUsername
        }

        if(newPassword) {
            const hashedPwd = await bcrypt.hash(newPassword, 10)
            foundUser.password = hashedPwd
        }

        await foundUser.save()
        res.json({ message: 'Success data changed'})
    } catch(err) {
        return res.status(500).json({ message: err?.message})
    }
    
}

// @desc Refresh Token
// @route GET /auth/refresh
// @access Public
const refreshToken = async (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204)
    const refreshToken = cookies.jwt
    res.clearCookie('jwt', { httpOnly: true })
   
    const foundUser = await User.findOne({refreshToken}).exec()
    if(!foundUser) {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if(err) return res.sendStatus(403)

                const hackedUser = await User.findOne({username: decoded.username}).exec()
                if(hackedUser) {
                    hackedUser.refreshToken = []
                    await hackedUser.save()
                }
            }
        )
       
        return res.sendStatus(403)
    }

    const refreshTokenArr = foundUser.refreshToken.filter(rt => rt !== refreshToken)

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if(err) {
                foundUser.refreshToken = [...refreshTokenArr]
                await foundUser.save()
            }
            if(err || foundUser._id.toString() !== decoded.id) return res.sendStatus(403)

            const accessToken = jwt.sign(
                {id: foundUser._id, username: foundUser.username, roles: foundUser.roles},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '5m'}
            )
                
            const newRefreshToken = jwt.sign(
                {id: foundUser._id},
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn: '15m'}
            )

            foundUser.refreshToken = [...refreshTokenArr, newRefreshToken]
            await foundUser.save()
            
            res.cookie('jwt', newRefreshToken,{ httpOnly: true, maxAge: 15 * 60 * 1000 })
            res.json({accessToken})
        }
    )
}

module.exports = {
    login,
    logout,
    updateCredentials,
    refreshToken
}