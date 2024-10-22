const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");

const asyncHandler = require('express-async-handler');
const { generateToken } = require('../config/jwtToken');
const validateMongodbId  = require('../utils/validateMongodbId');
const {generateRefreshToken} = require('../config/refreshToken');
const sendEmail = require('./emailController');

const createUser = asyncHandler(async (req,res) =>{
    const findUser = await User.findOne({email  : req.body.email});
    if( !findUser){
        const newUser = await User.create(req.body);
        res.status(201).json(newUser);
    }
    else{
        throw new Error('User already exists');
    }
        });

//login user
 const loginUser = asyncHandler(async (req,res) =>{
    const {email,password} = req.body;
    //check user exists or not
    const findUser = await User.findOne({email});
    if(findUser && (await findUser.isPasswordMatched(password))){
        const refreshToken = generateRefreshToken(findUser._id);
        const updateUser = await User.findByIdAndUpdate(findUser._id,{refreshToken},{new:true});

        res.cookie('refreshToken',refreshToken,{httpOnly:true,maxAge:3*24*60*60*1000}); 
      res.json({
        _id:findUser._id,
        firstname:findUser.firstname,
        lastname:findUser.lastname,
        email:findUser.email,
        mobile:findUser.mobile,
        token:generateToken(findUser._id),
    });   
}
else{
    throw new Error('Invalid email or password');
}
});

//logout user
const logoutUser = asyncHandler(async (req,res) =>{
    const cookie = req.cookies;
    if(!cookie.refreshToken){
        throw new Error('Refresh token not found in cookie');
    }
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user){
        res.clearCookie('refreshToken',{httpOnly:true,secure:true});
        return res.sendStatus(204);
    }
    await User.findOneAndUpdate({refreshToken},{refreshToken:'',},{new:true});
    res.clearCookie('refreshToken',{httpOnly:true,secure:true}); 
    res.sendStatus(204);
});


//get all users
const getUsers = asyncHandler(async (req,res) =>{
try{
    const getUsers = await User.find({});
    res.json(getUsers);
}
catch(error){
    throw new Error(error);

}});

//get a single user 
const getUser = asyncHandler(async (req,res) =>{
    const {id} = req.params;
    validateMongodbId(id);
    try{
        const getUser = await User.findById(id);
        if(getUser){
            res.json(getUser);
        }
        else{
            res.status(404).json({message:'User not found'});
        }
    }
    catch(error){
        throw new Error(error);
}});

//delete a user
const deleteUser = asyncHandler(async (req,res) =>{
    const {id} = req.params;
    validateMongodbId(id);
    try{
        const deleteUser = await User.findByIdAndDelete(id);
        if(deleteUser){
            res.json({message:'User deleted successfully'});
        }
        else{
            res.status(404).json({message:'User not found'});
        }
    }
    catch(error){
        throw new Error(error);
}});

//handle refresh token
const handleRefreshToken = asyncHandler(async (req,res) =>{ 
    const cookie = req.cookies ;
    if(!cookie.refreshToken){
        throw new Error('Refresh token not found in cookie');
    }
const refreshToken = cookie.refreshToken;
const user = await User.findOne({refreshToken});
if(!user){
    throw new Error('User not found');
}
jwt.verify(refreshToken,process.env.JWT_SECRET,(err,decoded) =>{
    if(err || decoded.id !== user.id){
        throw new Error('Invalid refresh token');
    }
    const accessToken = generateToken(user.id);
    res.json({accessToken});
});
});


//update a user
const updateUser = asyncHandler(async (req,res) =>{
    const {id} = req.user;
    validateMongodbId(id);
    try{
        const updateUser = await User.findByIdAndUpdate (id,req.body,{new:true});
        if(updateUser){
            res.json(updateUser);
        }
        else{
            res.status(404).json({message:'User not found'});
        }
    }
    catch(error){
        throw new Error(error);
    }});

//block a user
const blockUser = asyncHandler(async (req,res) =>{
    const {id} = req.params;
    validateMongodbId(id);
    try{
        const blockUser = await User.findByIdAndUpdate(id,{isBlocked:true},{new:true});
        if(blockUser){
            res.json(blockUser);
        }
        else{
            res.status(404).json({message:'User not found'});
        }
    }
    catch(error){
        throw new Error(error);
    }});

//unblock a user
const unblockUser = asyncHandler(async (req,res) =>{
    const {id} = req.params;
    validateMongodbId(id);
    try{
        const unblockUser = await User.findByIdAndUpdate(id,{isBlocked:false},{new:true});
        if(unblockUser){
            res.json(unblockUser);
        }
        else{
            res.status(404).json({message:'User not found'});
        }
    }   
    catch(error){
        throw new Error(error);
    }});

const updatePassword = asyncHandler(async (req,res) =>{
    const {id} = req.user;
    const {oldPassword,newPassword} = req.body;
    validateMongodbId(id);
    try{
        const user = await User.findById(id);
        if(user && (await user.isPasswordMatched(oldPassword))){
            user.password = newPassword;
            await user.save();
            res.json({message:'Password updated successfully'});
        }
        else{
            res.status(401).json({message:'Invalid password'});
        }
    }
    catch(error){
        throw new Error(error);
    }});

    const forgotPasswordToken = asyncHandler(async (req, res) => {
        console.log("forgot password token");
        const { email } = req.body;
        const user = await User.findOne({ email });
    
        if (!user) {
            throw new Error("user not found");
        }
    
        try {
            const token = await user.createPasswordResetToken();
            await user.save();
    
            // Use template string and wrap the HTML content in quotes
            const resetUrl = `<a href="http://localhost:5000/api/auth/password-reset/${token}">Reset Password</a>`;
            
            const data = {
                to: email,
                subject: 'Password Reset Token',
                text: "You have requested a password reset token. Please make a PUT request to the following link to reset your password",
                html: `You have requested a password reset. Click the link to proceed: ${resetUrl}`
            };
    
            await sendEmail(data);
            res.json(token);
        } catch (err) {
            throw new Error(err.message); // Use err.message to get the error message string
        }
    });
    

const resetPassword = asyncHandler(async(req,res)=>{
    const {password} = req.body;
    const {token} = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex"); 

    const user = await User.findOne({
        passwordResetToken : hashedToken,
        passwordResetExpires: {$gt : Date.now()},
    })
    if(!user){
        throw new Error("Token Expired,Please try again later");
    }
    user.password = password;
    user.passwordResetToken = undefined ;
    user.passwordResetExpires = undefined ;
    await user.save() ;
    res.json(user);
});


module.exports = {createUser,loginUser,logoutUser,getUsers,getUser,deleteUser,handleRefreshToken,updateUser,
    blockUser,unblockUser,updatePassword,forgotPasswordToken,resetPassword};


    