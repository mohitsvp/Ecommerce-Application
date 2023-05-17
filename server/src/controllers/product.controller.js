const asyncHandler = require('express-async-handler');
const { Product } = require('../models/product.model');
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
    try {
        if(req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const product = await Product.create(req.body);
        return res.send(product);
    } catch (error) {
        throw new Error(error)
    }
})

const getAllProducts = asyncHandler(async (req, res) => {
    try {
        const products = await Product.find();
        return res.send(products);
    } catch (error) {
        throw new Error(error)
    }
})

const getAProduct = asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const product = await Product.findById(id);
        res.send(product);
    } catch (error) {
        throw new Error(error)
    }
})

const updateProduct = asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        if(req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const product = await Product.findByIdAndUpdate(id, req.body, {new: true});
        res.send(product);
    } catch (error) {
        throw new Error(error)
    }
})

const deleteProduct = asyncHandler(async (req, res) => {
    try {
        const {id} = req.params;
        const product = await Product.findByIdAndDelete(id);
        res.send(product);
    } catch (error) {
        throw new Error(error)
    }
})

module.exports = {getAllProducts, getAProduct, createProduct, updateProduct, deleteProduct};