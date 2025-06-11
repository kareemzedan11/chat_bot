const Driver = require("../models/driverModel");
const Trip = require("../models/tripModel");

// Get driver profile
exports.getProfile = async (req, res) => {
	try {
		const driver = await Driver.findById(req.user.id).select("-password");
		if (!driver) {
			return res.status(404).json({ error: "Driver not found." });
		}
		res.status(200).json(driver);
	} catch (err) {
		console.error("Error in getProfile:", err.message);
		res.status(500).json({ error: "Internal server error." });
	}
};

// Update driver profile
exports.updateProfile = async (req, res) => {
	try {
		const { name, phone, email } = req.body;
		const updatedDriver = await Driver.findByIdAndUpdate(
			req.user.id,
			{ name, phone, email },
			{ new: true, runValidators: true }
		).select("-password");

		res.status(200).json(updatedDriver);
	} catch (err) {
		console.error("Error in updateProfile:", err.message);
		res.status(500).json({ error: "Internal server error." });
	}
};

// View balance
exports.viewBalance = async (req, res) => {
	try {
		const driver = await Driver.findById(req.user.id);
		res.status(200).json({ balance: driver.balance });
	} catch (err) {
		console.error("Error in viewBalance:", err.message);
		res.status(500).json({ error: "Internal server error." });
	}
};

// Handle trip requests
exports.handleTripRequests = async (req, res) => {
	try {
		const trips = await Trip.find({ status: "pending" }).populate(
			"user",
			"name phone"
		);
		res.status(200).json(trips);
	} catch (err) {
		console.error("Error in handleTripRequests:", err.message);
		res.status(500).json({ error: "Internal server error." });
	}
};

exports.getDriverProfileImage = async (req, res) => {
	try {
		const { driverId } = req.params;

		const driver = await Driver.findById(driverId);
		if (!driver) {
			return res.status(404).json({ error: "Driver not found!" });
		}

		res.status(200).json({ profileImage: driver.profileImage });
	} catch (err) {
		console.error("🚨 Error fetching driver profile image:", err.message);
		res.status(500).json({ error: "❌ Failed to retrieve profile image." });
	}
};

exports.updateDriverLocation = async (req, res) => {
	try {
		const { driverId, lat, lng } = req.body;

		if (!driverId || !lat || !lng) {
			return res.status(400).json({ error: "All fields are required!" });
		}

		const driver = await Driver.findByIdAndUpdate(
			driverId,
			{ location: { lat, lng } },
			{ new: true }
		);

		if (!driver) {
			return res.status(404).json({ error: "Driver not found!" });
		}

		res.status(200).json({
			message: "Location updated!",
			location: driver.location,
		});
	} catch (err) {
		console.error("🚨 Error updating location:", err.message);
		res.status(500).json({ error: "❌ Failed to update location." });
	}
};

exports.getDriverLocation = async (req, res) => {
	try {
		const { driverId } = req.params;

		const driver = await Driver.findById(driverId);
		if (!driver || !driver.location) {
			return res.status(404).json({ error: "Location not found!" });
		}

		res.status(200).json({ location: driver.location });
	} catch (err) {
		console.error("🚨 Error fetching location:", err.message);
		res.status(500).json({ error: "❌ Failed to retrieve location." });
	}
};
