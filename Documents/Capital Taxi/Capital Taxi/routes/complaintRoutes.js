const express = require("express");
const complaintController = require("../controllers/complaintController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/file", protect, complaintController.fileComplaint);
router.get("/all", protect, complaintController.getAllComplaints);
router.put("/resolve", protect, complaintController.resolveComplaint);

module.exports = router;
