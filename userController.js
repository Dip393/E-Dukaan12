import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate password format
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.json({ success: false, message: "Password must be at least 8 characters long, contain at least one letter and one number." });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


// Route for user registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Checking if the user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }
    
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.json({ success: false, message: "Password must be at least 8 characters long, contain at least one letter and one number." });
    }

    // Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    // Generate token
    const token = createToken(user._id);

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    if(email===process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD){
      const token=jwt.sign(email+password, process.env.JWT_SECRET)
      res.json({success:true,token})
    }else{
      res.json({success:false,message: "Invalid credentials"})
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, adminLogin };
