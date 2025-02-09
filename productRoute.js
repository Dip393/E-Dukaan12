import express from 'express';
import {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
} from '../controllers/productController.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const productRouter = express.Router();

// Route to add a product
productRouter.post(
  '/add',
  adminAuth,
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
  ]),
  addProduct
);

// Route to remove a product
productRouter.delete('/remove/:id', adminAuth, removeProduct);


// Route to fetch details of a single product
productRouter.post('/single', singleProduct);

// Route to list all products
productRouter.get('/list', listProducts);

export default productRouter;
