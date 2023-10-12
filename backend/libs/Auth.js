const jwt = require('jsonwebtoken');
const User = require('../Models/User');

// Middleware to verify JWT tokens
const verifyToken = async (req, res, next) => {
    if (!req.headers.authorization) {
        res.status(403).json({
            status: "failed",
            code: 403,
            message: "Token not found Authentication failed",
        });
    }
    let token = req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(403).json({
            status: false,
            message: "Token not found",
        });
    }
    try {
        const decoded = jwt.verify(token, 'NOTENEST');
        // console.log('Token is valid & the username: ', decoded.username, ", id is:", decoded.userId);
        const user = await User.findOne({ _id: decoded.userId })

        if (decoded.username !== user?.username) {
            return res.status(401).json({
                status: false,
                message: "Not Authorized",
            });
        }

        req.userId = decoded?.userId
        req.user = user?.username;
        req.accessToken = token
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                statusCode: 401,
                status: "FAILURE",
                message: 'Token has expired !'
            });
        } else {
            return res.status(401).json({
                statusCode: 401,
                status: "FAILURE",
                message: 'Authentication failed'
            });
        }
    }
};

module.exports = {
    verifyToken,
};
