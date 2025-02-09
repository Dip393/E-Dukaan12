const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('../models/user');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { console } = require('inspector');

// let SummarizerManager = require("node-summarizer").SummarizerManager;

require('dotenv').config();
// const upload = multer({ dest: 'uploads/' });

// Plant.ID API configuration

const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

//Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

// API request to /api/users

//Contact Form
router.post('/contact-form', (req, res) => {
  const { name, email, message } = req.body;
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // User's email
      to: process.env.EMAIL_USER, // Admin's email
      subject: `New Message from ${name}`,
      text: `Profession: ${profession}\nMessage: ${message}\nFrom: ${email}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ msg: 'Error sending email' });
      } else {
        return res.status(200).json({ msg: 'Message sent successfully' });
      }
    });
  } catch (err) {
    // console.error(err.message);
    res.status(500).send('Server error');
  }
});

//For chatbot
router.post('/chatbot', async (req, res) => {
  const input = req.body.prompt;

  try {
    const result = await model.generateContent(input);
    // console.log('Generated result:', result.response.text());
    res.json({ text: result.response.text() });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Register Route
router.post('/signup', async (req, res) => {
  const { email } = req.body;
  console.log(email);
  
  try {
    console.log(email);
    // Check if the user already exists and has completed registration
    let user = await User.findOne({ email });

    // If user exists and has completed registration
    if (user && user.userName && user.password) {
      return res.status(200).json({ error: true, msg: 'User already exists' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    if (user && !user.userName) {
      // User exists with only email and otp, update the OTP
      user.otp = otp;
      await user.save();
    } else {
      // Create new user with just email, userId, and OTP
      user = new User({
        email,
        otp,
      });
      await user.save();
    }

    // Send OTP to email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ msg: 'Error sending OTP' });
      } else {
        res.status(200).json({ msg: 'OTP sent successfully', email });
      }
    });
  } catch (err) {
    res.status(500).send('Server error'); // Do not expose specific error details
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp, userName, password, userType } = req.body;

  try {
    // Find user by email
    let user = await User.findOne({ email });

    if (!user || !user.otp) {
      return res.status(200).json({ error: true, msg: 'OTP has not been sent. Please sign up first.' });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(200).json({ error: true, msg: 'Invalid OTP' });
    }

    const _userType = email === process.env.EMAIL_USER ? 'admin' : userType;

    // Update user details after successful OTP verification
    user.userName = userName;
    user.password = bcrypt.hashSync(password, 10); // Hash password
    user.otp = undefined;  // Remove OTP after verification
    user.userType = _userType;

    await user.save();

    res.status(200).json({ msg: 'User registered successfully', isAdmin: email === EMAIL_USER });
  } catch (err) {
    res.status(500).send('Server error');
  }
});
//Login Route
router.post('/login', async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    // Find user by email
    let user = await User.findOne({ email });
    if (!user || !user.userName) {
      return res.status(200).json({ error: true, msg: 'User not found' });
    }
    if(!user.userType){
      return res.status(200).json({ error: true, msg: 'Invalid User Type' });
    }
    if(user.userType !== userType){
      return res.status(200).json({ error: true, msg: 'Access denied' });
    }
    // Compare the entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(200).json({ error: true, msg: 'Invalid email or password' });
    }

    // OTP handling and JWT generation
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    user.otp = otp;
    await user.save();

    // Send OTP to email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Login OTP Verification',
      text: `Your OTP is ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ msg: 'Error sending OTP' });
      } else {
        res.status(200).json({ msg: 'OTP sent successfully', userId: user._id });
      }
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.post('/verify-login-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    let user = await User.findOne({ email });

    if (!user || !user.otp) {
      return res.status(200).json({ error: true, msg: 'OTP has not been sent. Please try logging in again.' });
    }

    if (user.otp !== otp) {
      return res.status(200).json({ error: true, msg: 'Invalid OTP' });
    }

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_TOKEN, { expiresIn: '168h' });

    user.otp = undefined;
    await user.save();
    const userstatus = user.userType
    if(userstatus === 'admin'){
      return res.status(200).json({ error: false, msg: 'Login successful', isAdmin: true, token });
    }
    if(userstatus === 'doctor'){
      return res.status(200).json({ error: false, msg: 'Login successful', isDoctor: true, token });
    }
    else{
      return res.status(200).json({ error: false, msg: 'Login successful', isAdmin: false, token });
    }
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// Logout Route
router.post('/logout', async (req, res) => {
  const { email } = req.body;

  try {

    // Find the user by email
    let user = await User.findOne({ email });
    
    if (!user) {
      return res.status(200).json({error:true, msg: 'User not found' });
    }

    // Update loggedInStatus to false
    user.loggedInStatus = false;
    await user.save();

    res.status(200).json({ msg: 'Logout successful' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});
// Forgot Password Route - Step 1: Generate OTP and send to email address
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // User-specific error, return 400 but not log
      return res.status(400).json({ msg: 'User not found' });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    user.otp = otp;
    await user.save();

    // Send OTP to email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}`
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        // Server error when sending email
        return res.status(500).json({ msg: 'Error sending OTP, please try again later.' });
      }
      // Success
      return res.status(200).json({ msg: 'OTP sent successfully', userId: user._id });
    });

  } catch (err) {
    // Server error, log it and return 500 status
    return res.status(500).json({ msg: 'Server error, please try again later.' });
  }
});

// OTP Verification Route - Step 2: Verify OTP and allow password reset
router.post('/verify-forgotp-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
      // User-specific error, return 400 but not log
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    // OTP is valid, allow password reset
    return res.status(200).json({ msg: 'OTP verified successfully' });
  } catch (err) {
    // Server error, log it and return 500 status
    return res.status(500).json({ msg: 'Server error, please try again later.' });
  }
});

// Password Reset Route - Step 3: Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // User-specific error, return 400 but not log
      return res.status(400).json({ msg: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.otp = undefined; // Clear OTP after password reset
    await user.save();

    // Success
    return res.status(200).json({ msg: 'Password changed successfully' });
  } catch (err) {
    // Server error, log it and return 500 status
    return res.status(500).json({ msg: 'Server error, please try again later.' });
  }
});
// Find the user by email
router.post('/getUserName', async (req, res) => {
  const { email } = req.body; 
    try {
        // Fetch user by email, selecting only the userName field
        const user = await User.findOne({ email: email }, 'userName');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ name: user.userName });
    } catch (error) {
        console.error('Error fetching user by email:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/user-type', async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({email});
    if (user.userType === 'admin') {
      return res.status(200).json({ userType: 'admin' });
    }
    else if (user.userType === 'doctor') {
      return res.status(200).json({ userType: 'doctor' });
    }
    else if (user.userType === 'patient') {
      return res.status(200).json({ userType: 'patient' });
    }
  } catch (err) {
    res.status(500).send('Server error');
  }
});
//Check if the shop is registered
router.post('/doctor-registered', async (req, res) => {
  const { email } = req.body;
  try {
    let doctor = await User.findOne({ email });
    if (doctor.isRegistered) {
      return res.status(200).json({ doctorRegistered: true });
    }
    else {
      return res.status(200).json({ doctorRegistered: false });
    }
  } catch (err) {
    res.status(500).send('Server error');
  }
});
//Fetch shop details which are not verified
router.get('/fetch-unverified-doctors', async (req, res) => {
  const { page = 0 } = req.query; // Default to page 0 if not provided
  const PAGE_SIZE = 10; // Number of shops per page

  try {
    // Find shops with pagination
    const doctors = await User.find({ isVerified: false , isRegistered: true })
      .skip(page * PAGE_SIZE) // Skip the first (page * PAGE_SIZE) results
      .limit(PAGE_SIZE) // Limit results to PAGE_SIZE
      .exec();

    // Get the total number of doctors
    const totalDoctors = await User.countDocuments({ isVerified: false, isRegistered: true });

    res.status(200).json({
      doctors,
      total: totalDoctors, // Total number of doctors
    });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update shop details to verified
router.post('/verify-doctor', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          isVerified: true
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Doctor verified successfully' });
  } catch (error) {
    console.error('Error verifying shop:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//To register a new doctor
router.post('/register-doctor', async (req, res) => {
  const {
    email,
    doctorName,
    doctorRegistrationNumber,
    gender,
    details,
    specialization,
    experienceInYears,
    experience,
    qualification,
    clinicName,
    address,
    city,
    availableMorningStartingTime,
    availableMorningEndingTime,
    availableAfternoonStartingTime,
    availableAfternoonEndingTime,
    availableEveningStartingTime,
    availableEveningEndingTime,
    availableDays,
    contactNumber,
    achievements,
    awards,
    memberships,
    researches,
    languages,
    isRegistered,
    isVerified
  } = req.body;

  try {
    let doctor = await User.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    Object.assign(doctor, {
      doctorName,
      doctorRegistrationNumber,
      gender,
      details,
      specialization,
      experienceInYears,
      experience,
      qualification,
      clinicName,
      address,
      city,
      availableMorningStartingTime,
      availableMorningEndingTime,
      availableAfternoonStartingTime,
      availableAfternoonEndingTime,
      availableEveningStartingTime,
      availableEveningEndingTime,
      availableDays,
      contactNumber,
      achievements,
      awards,
      memberships,
      researches,
      languages,
      isRegistered,
      isVerified
    });

    await doctor.save();
    return res.status(200).json({ message: 'Doctor details updated successfully', doctor });
  } catch (error) {
    console.error('Error updating doctor details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

//Fetch Doctor details
router.post('/fetch-doctor-details', async (req, res) => {
  const { email } = req.body;
  try {
    let doctor = await User.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json({ doctor });
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//Fetch Doctor details by filtering specialization, city, language & gender
router.post('/fetch-filtered-doctor-details', async (req, res) => {
  const { specialization, city, language, gender } = req.body;

  const query = {
    isRegistered: true,
    isVerified: true,
  };

  if (specialization) query.specialization = specialization;
  if (city) query.city = city;
  if (language) query.languages = { $in: [language] };
  if (gender) query.gender = gender;

  try {
    const doctors = await User.find(query);

    res.status(200).json({ doctors }); // Return an empty array if no doctors match
  } catch (error) {
    console.error('Error fetching doctor details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Save doctor's time slots to the database
router.post('/save-time-slots', async (req, res) => {
  const { doctorId, slots } = req.body;

  try {
    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    doctor.slots = slots.slots;
    doctor.todayNotAvailable = false;

    await doctor.save();

    res.status(200).json({ message: 'Time slots updated successfully!' });
  } catch (error) {
    console.error('Error saving slots:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Reset slots at 8 AM daily
const schedule = require('node-schedule');

schedule.scheduleJob('43 12 * * *', async () => {
  try {
    const doctors = await User.find({ userType: 'doctor', isVerified: true });
    for (const doctor of doctors) {
      doctor.todayNotAvailable = false;
      doctor.slots.forEach((slot) => {
        slot.available = true;
        slot.patientMail = null;
        slot.patientName = null;
        slot.occupied = false;
      });
      await doctor.save();
    }
    console.log('Reset slots for all doctors at 12:35 PM');
  } catch (error) {
    console.error('Error resetting slots:', error);
  }
});

router.post('/update-slots', async (req, res) => {
  const { doctorId, slots } = req.body;

  try {
    let doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Handle slot changes
    const emailPromises = [];
    slots.forEach((newSlot) => {
      const oldSlot = doctor.slots.find((slot) => slot.time === newSlot.time);
      if (oldSlot && oldSlot.available && !newSlot.available && oldSlot.patientMail) {
        // Clear patient details
        newSlot.patientName = null;
        newSlot.patientMail = null;

        // Prepare email
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: oldSlot.patientMail,
          subject: 'Appointment Cancellation',
          text: `Your appointment for the time slot ${newSlot.time} has been canceled by the doctor.`,
        };

        emailPromises.push(sendMail(mailOptions));
      }
    });

    // Save updated slots
    doctor.slots = slots;
    await doctor.save();

    // Send emails
    await Promise.all(emailPromises);

    res.status(200).json({ message: 'Slots updated successfully!' });
  } catch (error) {
    console.error('Error updating slots:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Function to send emails using nodemailer
const sendMail = (mailOptions) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter.sendMail(mailOptions);
};
//Find all appointments for a specific doctor
router.post('/find-appointments', async (req, res) => {
  const { doctorId } = req.body;

  try {
    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const appointments = doctor.slots.filter(
      (slot) => slot.occupied === true && slot.patientMail
    );

    res.status(200).json({ appointments });
  } catch (error) {
    console.error('Error finding appointments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//Find all unoccupied slots of a particular doctor using doctor id
router.post('/find-doctor-with-unoccupied-slots', async (req, res) => {
  const { email } = req.body;

  try {
    const doctor = await User.findOne({email});
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Filter slots based on the condition
    const unoccupiedSlots = doctor.slots.filter(
      (slot) => slot.occupied === undefined || slot.occupied === false && slot.available === true
    );

    // Attach the filtered slots back to the doctor object
    const _doctor = {
      ...doctor.toObject(), // Convert the Mongoose document to a plain JavaScript object
      slots: unoccupiedSlots,
    };

    res.status(200).json(_doctor);
  } catch (error) {
    console.error('Error finding doctor with unoccupied slots:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//Book Appointment
router.post('/book-appointment', async (req, res) => {
  const { doctorId, slotId, email, userName } = req.body;

  try {
    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const slot = doctor.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    if (slot.occupied) {
      return res.status(400).json({ message: 'Slot is already occupied' });
    }
    //Check if the user already booked 2 slots, if yes then don't book the appointment
    const userAppointments = doctor.slots.filter(
      (s) => s.patientMail === email && s.occupied === true
    ).length;

    if (userAppointments >= 2) {
      return res.status(200).json({ message: 'You can only book 2 appointments per doctor.' });
    }


    // Update slot details
    slot.occupied = true;
    slot.patientMail = email;
    slot.patientName = userName;

    await doctor.save();
    res.status(200).json({ message: 'Appointment booked successfully!' });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//Fetch Doctor's profile from User where user email is present in slots list
router.post('/user-appointments', async (req, res) => {
  const { userEmail } = req.body;

  try {
    // Find doctors where at least one slot has a matching patientMail
    const doctorsWithAppointments = await User.find({
      'slots.patientMail': userEmail,
    });

    if (!doctorsWithAppointments.length) {
      return res.status(200).json({ message: 'No appointments found.' });
    }

    // Filter only slots where the user's email is present
    const filteredDoctors = doctorsWithAppointments.map((doctor) => ({
      _id: doctor._id,
      doctorName: doctor.doctorName,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experienceInYears: doctor.experienceInYears,
      gender: doctor.gender,
      email: doctor.email,
      clinicName: doctor.clinicName,
      city: doctor.city,
      languages: doctor.languages,
      slots: doctor.slots.filter((slot) => slot.patientMail === userEmail),
    }));

    res.status(200).json(filteredDoctors);
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//To cancel appointment using doctor Id & slot id
router.post('/cancel-appointment', async(req,res) => {
  let { doctorId, slotId } = req.body;
  try {
    const doctor = await User.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const slot = doctor.slots.id(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (!slot.occupied) {
      return res.status(400).json({ message: 'Slot is not occupied' });
    }
    // Update slot details
    slot.occupied = false;
    slot.patientMail = null;
    slot.patientName = null;
    await doctor.save();
    res.status(200).json({ message: 'Appointment cancelled successfully!' });
  }catch(error){
    res.status(500).json({ message: 'Internal server error' });
  }
})
//Book Emergency Appointment
router.post('/book-emergency-appointment', async (req, res) => {
  const { name, phone, email, area, city, state, postCode } = req.body;

  try {
    // Validate input
    if (!name || !phone || !email || !area || !city || !state || !postCode) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Add your logic to store the appointment in the database
    // const newAppointment = {
    //   name,
    //   phone,
    //   email,
    //   address: {
    //     area,
    //     city,
    //     state,
    //     postCode,
    //   },
    //   createdAt: new Date(),
    // };

    // Mock saving to DB (replace with actual DB call)

    res.status(200).json({ message: 'Appointment booked successfully!' });
  } catch (error) {
    console.error('Error booking emergency appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router