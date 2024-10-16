const express = require('express');
const router = express.Router();
const {isAdmin,authMiddleware} = require('../middlewares/authMiddleware');
const {createProduct,getaProducts,getAllProduct,updateProduct,deleteProduct}= require('../controller/productControl');


router.post("/", authMiddleware,isAdmin, createProduct);
router.get("/:id", getaProducts);
router.put("/:id",authMiddleware,isAdmin,updateProduct);
router.delete("/:id",authMiddleware,isAdmin, deleteProduct);
router.get("/", getAllProduct);



module.exports = router;