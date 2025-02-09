import { v2 as cloudinary } from 'cloudinary';
import productModel from '../models/productModel.js';

// Function to add a product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, sizes, bestseller } = req.body;

    // Extract images from request
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];
    const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

    // Upload images to Cloudinary
    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
        return result.secure_url;
      })
    );

    // Prepare product data
    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === 'true', // Convert bestseller to boolean
      sizes: JSON.parse(sizes), // Parse sizes if sent as a JSON string
      image: imagesUrl,
      date: Date.now(),
    };

    console.log('Product Data:', productData);

    // Save product to database
    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: 'Product Added' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.json({ success: false, message: error.message });
  }
};

// Function to list all products
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error listing products:', error);
    res.json({ success: false, message: error.message });
  }
};

// Function to remove a product
const removeProduct = async (req, res) => {
  try {
      const { id } = req.params;  // Get id from URL params
      const deletedProduct = await productModel.findByIdAndDelete(id);

      if (!deletedProduct) {
          return res.status(404).json({ success: false, message: "Product not found" });
      }

      res.json({ success: true, message: 'Product Removed' });
  } catch (error) {
      console.error('Error removing product:', error);
      res.status(500).json({ success: false, message: error.message });
  }
};


// Function to fetch a single product's details
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.json({ success: false, message: error.message });
  }
};

export { listProducts, addProduct, removeProduct, singleProduct };
