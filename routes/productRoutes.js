const express = require('express');
const router = express.Router();

const {createProduct,getaProducts,getAllProduct}= require('../controller/productControl');


router.post("/", createProduct);
router.get("/", getAllProduct);
router.get("/:id", getaProducts);


module.exports = router;