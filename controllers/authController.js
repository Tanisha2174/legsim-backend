const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendOtp } = require("../utils/sendOtp");

// REGISTER A NEW USER
exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        user = new User({ email, password: hashedPassword });
        await user.save();

        res.status(201).json({ msg: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN USER
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        // Compare Passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // Set token as HTTP-only cookie
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

        res.json({ msg: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGOUT USER
exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ msg: "Logged out successfully" });
};

// GET USER PROFILE (Protected Route)
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔵 GOOGLE LOGIN CONTROLLER
exports.googleAuth = async (req, res) => {
    try {
        const user = req.user; // Get user from Passport.js
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
        res.redirect(`${process.env.CLIENT_URL}/dashboard`); // Redirect to frontend
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔵 PHONE LOGIN CONTROLLER - SEND OTP
exports.phoneLogin = async (req, res) => {
    try {
        const { phone } = req.body;

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP in database
        let user = await User.findOne({ phone });
        if (!user) {
            user = new User({ phone });
        }
        user.otp = otp;
        await user.save();

        // Send OTP
        await sendOtp(phone, otp);

        res.json({ msg: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🔵 VERIFY OTP CONTROLLER
exports.verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const user = await User.findOne({ phone });
        if (!user || user.otp !== otp) {
            return res.status(400).json({ msg: "Invalid OTP" });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // Clear OTP after successful login
        user.otp = null;
        await user.save();

        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
        res.json({ msg: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
