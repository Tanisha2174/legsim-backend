const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require('cors');
const cookieParser = require("cookie-parser");
const passport = require("passport");
const connectDB = require("./config/db");
const bodyParser = require('body-parser');

const rolesAndLocationsRoute = require('./routes/rolesAndLocations');
require("./config/passport"); // Google OAuth Strategy
dotenv.config();
const startupRoutes = require("./routes/startupMSMERoutes.js");

const authRoutes = require("./routes/auth");

const app = express();


// 🔹 Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

app.use(passport.initialize());

// 🔹 MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Failed:", err));

// 🔹 Routes
app.use("/api/auth", authRoutes);

const offeringRoutes = require('./routes/offeringRoutes');
app.use('/api/offerings', offeringRoutes);
const companyRegistrationRoute = require('./routes/serviceRoutes');  // Adjust path
app.use('/api', companyRegistrationRoute);
const subServiceRoutes = require("./routes/subServiceRoutes");
app.use("/api", subServiceRoutes);
app.use("/api/startup-msme", startupRoutes);
const jobApplicationsRoute = require('./routes/jobApplications');
app.use('/api/job-applications', jobApplicationsRoute);
app.use('/api', rolesAndLocationsRoute);
app.use("/uploads", express.static("uploads"));

connectDB();

const contactRoutes = require("./routes/contactRoutes");
app.use("/api/contact", contactRoutes);


// 🔹 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




