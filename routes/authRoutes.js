const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { createUser,loginUser,logoutUser,getUsers,getUser,deleteUser,handleRefreshToken,updateUser,blockUser
    ,unblockUser,updatePassword,forgotPasswordToken,resetPassword} = require('../controller/userControl.js');
const {authMiddleware,isAdmin} = require("../middlewares/authMiddleware.js")

//pre route - "/api/auth"
router.post('/register', createUser);
router.post("/login",loginUser);
router.get("/users",getUsers);
router.get("/refresh",handleRefreshToken);
router.get("/logout",logoutUser);
router.get("/:id",authMiddleware,isAdmin,getUser);
router.delete("/:id",deleteUser);
router.post("/forget-password-token",forgotPasswordToken);
router.put("/password-reset/:token",resetPassword);
router.put('/update-password',authMiddleware,updatePassword);
router.put("/edit-user",authMiddleware,updateUser);
router.put("/block-user/:id",authMiddleware,isAdmin,blockUser);
router.put("/unblock-user/:id",authMiddleware,isAdmin,unblockUser);

module.exports = router;