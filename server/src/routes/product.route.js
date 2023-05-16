const express = require('express');
const { getAllProducts, getAProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');

const router = express.Router();

router.get("/", getAllProducts),
router.get("/:id", getAProduct),
router.post("/", createProduct),
router.put("/:id", updateProduct),
router.delete("/:id", deleteProduct);

module.exports = router;