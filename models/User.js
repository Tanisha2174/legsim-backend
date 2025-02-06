const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true, sparse: true },
    password: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    otp: { type: String }, // Store OTP temporarily
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
