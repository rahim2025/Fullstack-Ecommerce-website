const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');

const createProduct = asyncHandler(async (req, res) => {   
    try{
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);

    } catch (error){
        res.status(400);
        throw new Error('Product not created');
    }
});

const getaProducts = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try{
        const findProduct = await Product.findById(id);
        res.status(200).json(findProduct);
    } catch (error){
        res.status(400);
        throw new Error('Products not found');
    }
});

const getAllProduct = asyncHandler(async (req, res) => {
    try{
        const getallProduct = await Product.find();
        res.status(200).json(getallProduct);
    }catch(err){
        throw new Error(err);
    }
}); 



module.exports = {createProduct,getaProducts,getAllProduct};