const express = require("express");
const adminController = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/users", protect, restrictTo("admin"), adminController.getAllUsers);
router.get(
	"/drivers",
	protect,
	restrictTo("admin"),
	adminController.getAllDrivers
);
router.delete(
	"/user/:id",
	protect,
	restrictTo("admin"),
	adminController.deleteUser
);
router.delete(
	"/driver/:id",
	protect,
	restrictTo("admin"),
	adminController.deleteDriver
);
router.put(
	"/driver/:id",
	protect,
	restrictTo("admin"),
	adminController.editDriver
);
router.put(
	"/penalize-driver",
	protect,
	restrictTo("admin"),
	adminController.penalizeDriver
);
router.put(
	"/complaint/:id/resolve",
	protect,
	restrictTo("admin"),
	adminController.resolveComplaint
);

router.post(
	"/send-notification",
	protect,
	restrictTo("admin"),
	adminController.sendNotification
);
router.get(
	"/notifications",
	protect,
	restrictTo("admin"),
	adminController.getNotifications
);

router.get(
	"/complaints",
	protect,
	restrictTo("admin"),
	adminController.getAllComplaints
);

router.put("/user/:id", protect, restrictTo("admin"), adminController.editUser);
router.get("/trips", protect, restrictTo("admin"), adminController.getAllTrips);
module.exports = router; // ✅ This must be here!
