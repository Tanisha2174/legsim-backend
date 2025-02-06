const express = require("express");
const passport = require("passport");
const { googleAuth, phoneLogin, verifyOtp } = require("../controllers/authController");
const { register, login, logout, getProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/profile", authMiddleware, getProfile);
// Google OAuth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), googleAuth);

// Phone Login Routes
router.post("/login/phone", phoneLogin);
router.post("/login/verify-otp", verifyOtp);

module.exports = router;
