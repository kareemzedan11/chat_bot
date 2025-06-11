const express = require("express");
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, userController.updateProfile);
router.get("/order-history", protect, userController.viewOrderHistory);
router.post("/rate-driver", protect, userController.rateDriver);
router.post("/file-complaint", protect, userController.fileComplaint);

module.exports = router;
