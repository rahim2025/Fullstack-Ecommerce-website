const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

const createProduct = asyncHandler(async (req, res) => {   
    try{
        if(!req.body.slug){
            req.body.slug = slugify(req.body.title);
        }
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

        // Filtering
        const queryObj = {...req.query};
        console.log(queryObj);

        // Exclude fields
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);
        
        // filtering for greater than, less than, greater than or equal to, less than or equal to
        let queryStr = JSON.stringify(queryObj);
        console.log(queryStr);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        let query = Product.find(JSON.parse(queryStr));
        
        // Sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }
        else{
            query = query.sort('-createdAt');
        }

        // Field limiting
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        }
        else{
            query = query.select('-__v');
        }
        // Pagination
        const page = req.query.page*1 || 1;
        const limit = req.query.limit*1 || 10;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if(req.query.page){
            const productCount = await Product.countDocuments();
            if(skip >= productCount){
                throw new Error('This page does not exist');
            }
        }

        const product = await query;
        res.status(200).json(product);
    }catch(err){
        throw new Error(err);
    }
}); 


const updateProduct = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try{
        if(req.body.title){
            req.body.slung = slugify(req.body.title);
        }
        const updateProduct = await Product.findOneAndUpdate ({_id:id}, req.body, {new:true});
        
            
        if (!updateProduct) {
                res.status(404);
                throw new Error('Product not found');
            }
        res.status(200).json(updateProduct);
    } catch (error){
        res.status(400);
        throw new Error('Product not updated');
    }
    });

const deleteProduct = asyncHandler(async (req, res) => {
        const {id} = req.params;
        try{
            const deleteProduct = await Product.findOneAndDelete ({_id:id});
            
                
            if (!deleteProduct) {
                    res.status(404);
                    throw new Error('Product not found');
                }
            res.status(200).json(deleteProduct);
        } catch (error){
            res.status(400);
            throw new Error('Product not deleted');
        }
        });




module.exports = {createProduct,getaProducts,getAllProduct,updateProduct,deleteProduct};