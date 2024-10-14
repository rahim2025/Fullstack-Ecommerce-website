const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const authMiddleware = asyncHandler(async (req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
        try{
            if(token){
                const decoded = jwt.verify(token,process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id);
    
                next();
            }
   
        }catch(error){
            res.status(401);
            throw new Error('Not authorized, Please login again');
        }
    }
    else{
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const isAdmin = asyncHandler(async (req,res,next)=>{
    const {email} = req.user;
    const adminUser = await User.findOne({email});
    if(req.user && adminUser.role === 'admin'){
        next();
    }
    else{
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
});

module.exports = {authMiddleware,isAdmin};