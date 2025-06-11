const express = require("express");

const userRoutes = require("./userRoutes");
const driverRoutes = require("./driverRoutes");
const tripRoutes = require("./tripRoutes");
const complaintRoutes = require("./complaintRoutes");
const adminRoutes = require("./adminRoutes");
const authRoutes = require("./authRoutes");


const router = express.Router();

// Debug: Log what is being imported
// console.log("User Routes:", userRoutes);
// console.log("Driver Routes:", driverRoutes);
// console.log("Trip Routes:", tripRoutes);
// console.log("Complaint Routes:", complaintRoutes);
// console.log("Admin Routes:", adminRoutes);
// console.log("Auth Routes:", authRoutes);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/drivers", driverRoutes);
router.use("/trips", tripRoutes);
router.use("/complaints", complaintRoutes);
router.use("/admin", adminRoutes);


module.exports = router;
