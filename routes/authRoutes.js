const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { createUser,loginUser,logoutUser,getUsers,getUser,deleteUser,handleRefreshToken,updateUser,blockUser,unblockUser } = require('../controller/userControl.js');
const {authMiddleware,isAdmin} = require("../middlewares/authMiddleware.js")

//pre route - "/api/auth"
router.post('/register', createUser);
router.post("/login",loginUser);
router.get("/users",getUsers);
router.get("/refresh",handleRefreshToken);
router.get("/logout",logoutUser);
router.get("/:id",authMiddleware,isAdmin,getUser);
router.delete("/:id",deleteUser);
router.put("/edit-user",authMiddleware,updateUser);
router.put("/block-user/:id",authMiddleware,isAdmin,blockUser);
router.put("/unblock-user/:id",authMiddleware,isAdmin,unblockUser);

module.exports = router;