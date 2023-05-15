const asyncHandler = require('express-async-handler');
const  jwt  = require('jsonwebtoken');
const User = require('../models/user.model');

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if(req?.headers?.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
        try {
            if(token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                const user = await User.findById(decoded.id);
                req.user = user;
                next();
            }
        } catch (error) {
            throw new Error('User is not authorized token expired login again');
        }
    }
    else{
        throw new Error('There is no token in the headers')
    }
});


const isAdmin = asyncHandler(async (req, res, next) => {
    const {email} = req.user;
    const adminUser = await User.findOne({ email});
    if(adminUser.role == 'admin'){
        next();
    }
    else{
        throw new Error('You are not authorized since you are not admin');
    }
}
)

module.exports = {authMiddleware, isAdmin}