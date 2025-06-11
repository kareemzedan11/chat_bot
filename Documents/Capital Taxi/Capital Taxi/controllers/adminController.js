const User = require("../models/userModel");
const Driver = require("../models/driverModel");
const Complaint = require("../models/complaintModel");
const Trip = require("../models/tripModel");
const Notification = require("../models/notificationModel");
const { sendEmail  } = require("../services/emailService");

// Get all users
exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find().select("-password");
		res.status(200).json(users);
	} catch (err) {
		console.error("Error in getAllUsers:", err.message);
		res.status(500).json({ error: "Failed to retrieve users." });
	}
};

// Get all drivers
exports.getAllDrivers = async (req, res) => {
	try {
		const drivers = await Driver.find().select("-password");
		res.status(200).json(drivers);
	} catch (err) {
		console.error("Error in getAllDrivers:", err.message);
		res.status(500).json({ error: "Failed to retrieve drivers." });
	}
};

exports.editUser = async (req, res) => {
	try {
		const { id } = req.params;
		const updatedData = req.body;

		// Ensure the user exists before updating
		const user = await User.findByIdAndUpdate(id, updatedData, {
			new: true,
		});

		if (!user) {
			return res.status(404).json({ error: "❌ User not found." });
		}

		res.status(200).json({
			message: "✅ User updated successfully!",
			user,
		});
	} catch (err) {
		console.error("🚨 Error updating user:", err.message);
		res.status(500).json({ error: "❌ Failed to update user." });
	}
};
// Delete a user
exports.deleteUser = async (req, res) => {
	try {
		await User.findByIdAndDelete(req.params.id);
		res.status(200).json({ message: "User deleted successfully." });
	} catch (err) {
		console.error("Error in deleteUser:", err.message);
		res.status(500).json({ error: "Failed to delete user." });
	}
};

exports.editDriver = async (req, res) => {
	try {
		const { id } = req.params;
		const updatedData = req.body;

		const driver = await Driver.findByIdAndUpdate(id, updatedData, {
			new: true,
		});

		if (!driver) {
			return res.status(404).json({ error: "❌ Driver not found." });
		}

		res.status(200).json({
			message: "✅ Driver updated successfully!",
			driver,
		});
	} catch (err) {
		console.error("🚨 Error updating driver:", err.message);
		res.status(500).json({ error: "❌ Failed to update driver." });
	}
};
// Delete a driver
exports.deleteDriver = async (req, res) => {
	try {
		await Driver.findByIdAndDelete(req.params.id);
		res.status(200).json({ message: "Driver deleted successfully." });
	} catch (err) {
		console.error("Error in deleteDriver:", err.message);
		res.status(500).json({ error: "Failed to delete driver." });
	}
};

// Penalize a driver (reduce earnings)
exports.penalizeDriver = async (req, res) => {
	try {
		const { driverId, penaltyPercentage } = req.body;

		const driver = await Driver.findById(driverId);
		if (!driver) {
			return res.status(404).json({ error: "Driver not found." });
		}

		// Apply penalty (e.g., reduce earnings by percentage)
		const penaltyAmount = driver.balance * (penaltyPercentage / 100);
		driver.balance -= penaltyAmount;
		await driver.save();

		res.status(200).json({
			message: `Driver penalized by ${penaltyPercentage}%.`,
			newBalance: driver.balance,
		});
	} catch (err) {
		console.error("Error in penalizeDriver:", err.message);
		res.status(500).json({ error: "Failed to penalize driver." });
	}
};

// Resolve a complaint
exports.resolveComplaint = async (req, res) => {
	try {
		const { id } = req.params;
		const complaint = await Complaint.findById(id);

		if (!complaint) {
			return res.status(404).json({ error: "❌ Complaint not found." });
		}

		complaint.status = "resolved";
		await complaint.save();

		res.status(200).json({
			message: "✅ Complaint resolved successfully!",
		});
	} catch (err) {
		console.error("🚨 Error resolving complaint:", err.message);
		res.status(500).json({ error: "❌ Failed to resolve complaint." });
	}
};

// ✅ Send Notifications (Email + DB)
exports.sendNotification = async (req, res) => {
	try {
		const { role, message } = req.body;
		if (!role || !message) {
			return res
				.status(400)
				.json({ error: "❌ Role and message are required." });
		}

		// ✅ Get Recipients
		const recipients =
			role === "user"
				? await User.find({}, "email")
				: await Driver.find({}, "email");

		const recipientEmails = recipients.map((user) => user.email);

		// ✅ Send Email & Save Notification
		await sendEmail(role, recipientEmails, message);

		res.status(200).json({
			message: `📢 Notification sent & saved for ${role}s.`,
		});
	} catch (err) {
		console.error("🚨 Error sending notification:", err.message);
		res.status(500).json({ error: "❌ Failed to send notification." });
	}
};

// ✅ Get All Notifications for Admin Dashboard
exports.getNotifications = async (req, res) => {
	try {
		const notifications = await Notification.find().sort({ createdAt: -1 }); // Newest first
		res.status(200).json(notifications);
	} catch (err) {
		console.error("🚨 Error fetching notifications:", err.message);
		res.status(500).json({ error: "❌ Failed to fetch notifications." });
	}
};

exports.getAllComplaints = async (req, res) => {
	try {
		const complaints = await Complaint.find()
			.populate("user", "name email")
			.populate("driver", "name")
			.sort({ createdAt: -1 }); // Newest first

		res.status(200).json(complaints);
	} catch (error) {
		console.error("🚨 Error fetching complaints:", error.message);
		res.status(500).json({ error: "Failed to fetch complaints." });
	}
};

exports.getAllTrips = async (req, res) => {
	try {
		const complaints = await Trip.find()
			.populate("user", "name email")
			.populate("driver", "name")
			.sort({ createdAt: -1 }); // Newest first

		res.status(200).json(complaints);
	} catch (error) {
		console.error("🚨 Error fetching complaints:", error.message);
		res.status(500).json({ error: "Failed to fetch complaints." });
	}
};
