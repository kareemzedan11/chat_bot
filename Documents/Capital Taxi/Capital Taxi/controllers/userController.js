const User = require("../models/userModel");
const Trip = require("../models/tripModel");
const Complaint = require("../models/complaintModel");

exports.deleteAccount = async (req, res) => {
	try {
		await User.findByIdAndDelete(req.user.id);
		res.status(200).json({ message: "Account deleted successfully." });
	} catch (err) {
		console.error("Error in deleteAccount:", err.message);
		res.status(500).json({ error: "Internal server error." });
	}
};

// Get user profile
exports.getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");
		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}
		res.status(200).json(user);
	} catch (err) {
		console.error("Error in getProfile:", err.message);
		res.status(500).json({ error: "Internal server error." });
	}
};

// Update user profile
exports.updateProfile = async (req, res) => {
	try {
		const { name, phone, email } = req.body;
		const updatedUser = await User.findByIdAndUpdate(
			req.user.id,
			{ name, phone, email },
			{ new: true, runValidators: true }
		).select("-password");

		res.status(200).json(updatedUser);
	} catch (err) {
		console.error("Error in updateProfile:", err.message);
		res.status(500).json({ error: "Internal server error." });
	}
};

exports.viewOrderHistory = async (req, res) => {
	try {
		// Get the user including their orderHistory populated with trip details
		const user = await User.findById(req.user.id).populate({
			path: "orderHistory",
			select: "origin destination fare paymentMethod status createdAt",
			populate: {
				path: "driver",
				select: "name phone", // Optional: only populate name and phone from driver
			},
		});

		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}

		res.status(200).json(user.orderHistory);
	} catch (err) {
		console.error("Error in viewOrderHistory:", err.message);
		res.status(500).json({ error: "Internal server error." });
	}
};

// Rate a driver
exports.rateDriver = async (req, res) => {
	try {
		const { tripId, rating } = req.body;

		if (rating < 1 || rating > 5) {
			return res
				.status(400)
				.json({ error: "Rating must be between 1 and 5." });
		}

		const trip = await Trip.findById(tripId);
		if (!trip || trip.user.toString() !== req.user.id) {
			return res
				.status(404)
				.json({ error: "Trip not found or unauthorized." });
		}

		trip.rating = rating;
		await trip.save();
		res.status(200).json({ message: "Driver rated successfully!" });
	} catch (err) {
		console.error("Error in rateDriver:", err.message);
		res.status(500).json({ error: "Internal server error." });
	}
};

// File a complaint
exports.fileComplaint = async (req, res) => {
	try {
		const { tripId, description } = req.body;

		const trip = await Trip.findById(tripId);
		if (!trip || trip.user.toString() !== req.user.id) {
			return res
				.status(404)
				.json({ error: "Trip not found or unauthorized." });
		}

		const complaint = new Complaint({
			trip: tripId,
			user: req.user.id,
			driver: trip.driver,
			description,
		});

		await complaint.save();
		res.status(201).json({ message: "Complaint filed successfully." });
	} catch (err) {
		console.error("Error in fileComplaint:", err.message);
		res.status(500).json({ error: "Internal server error." });
	}
};
