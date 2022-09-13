const jwt = require('jsonwebtoken')
const config = require('config')
const db = require('../config/db')

module.exports = function(req, res, next) {
    // Get the token from the header
    const token = req.header('bearer-token')

    // Check if not token
    if(!token) {
        return res.status(401).json({
            msg: "No token, authorization denied"
        })
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        req.user = decoded.user
        next()
    } catch (error) {
        res.status(401).json({
            msg: "Token is not valid"
        })
    }
}