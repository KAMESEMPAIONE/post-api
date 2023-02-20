const jwt = require('jsonwebtoken')

const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.roles) return res.sendStatus(401)
        const result = req.roles.filter(role => allowedRoles.includes(role))
        
        if(!result?.length) return res.sendStatus(401)
        next()
    }
}

module.exports = verifyRoles