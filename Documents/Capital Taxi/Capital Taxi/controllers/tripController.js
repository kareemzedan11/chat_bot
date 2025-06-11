const Trip = require("../models/tripModel");
const User = require("../models/userModel");
const Driver = require("../models/driverModel");
const mongoose = require("mongoose");
const axios = require("axios");
const { getDirections } = require("../services/googleMapsService");
const {
	fuelCostPerLiter,
	carFuelEfficiency,
	baseFare,
} = require("../config/appConfig");
const { createPaymentLink } = require("../services/paymentService")
exports.calculateFare = async (req, res) => {
	try {
		const { origin, destination, paymentMethod } = req.query;

		if (!origin || !destination || !paymentMethod) {
			return res.status(400).json({
				error: "Origin, destination, and payment method are required!",
			});
		}

		// ✅ Get route details from GraphHopper
		const route = await getDirections(origin, destination);

		if (!route || !route.distance) {
			return res
				.status(400)
				.json({ error: "Failed to get route details." });
		}

		// ✅ Calculate fare
		const costPerKm = fuelCostPerLiter / carFuelEfficiency;
		const estimatedFare = (baseFare + route.distance * costPerKm).toFixed(
			2
		);

		// ✅ Send response
		res.status(200).json({
			fare: estimatedFare,
			paymentMethod,
			route,
		});
	} catch (err) {
		console.error("🚨 Error in calculateFare:", err.message);
		res.status(500).json({
			error: "Failed to calculate fare. Please try again later.",
		});
	}
};

exports.getTripDirections = async (req, res) => {
	try {
		const { origin, destination } = req.query;

		// ❌ Check if required parameters are missing
		if (!origin || !destination) {
			return res
				.status(400)
				.json({ error: "❌ Origin and destination are required." });
		}

		// ✅ Fetch directions from GraphHopper Service
		const directions = await getDirections(origin, destination);

		res.status(200).json(directions);
	} catch (err) {
		console.error("🚨 Error in getTripDirections:", err.message);
		res.status(500).json({ error: "❌ Failed to fetch trip directions." });
	}
};


exports.createTrip = async (req, res) => {
	const { id, origin, destination, paymentMethod, fare, distanceInKm } = req.body;

	if (!origin || !destination || !paymentMethod || !fare) {
		return res.status(400).json({ error: "All trip details are required." });
	}

	try {
		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const newTrip = new Trip({
			user: id,
			origin,
			destination,
			paymentMethod,
			fare,
			distanceInKm,
			status: "pending",
			isPaid: false,
			paymentDate: null,
		});

		await newTrip.save();

		await User.findByIdAndUpdate(id, {
			$push: { orderHistory: newTrip._id },
		});

		if (paymentMethod === "credit") {
			try {
				const paymentUrl = await createPaymentLink({
					amount: fare,
					clientName: user.name,
					clientEmail: user.email,
					tripId: newTrip._id,
					origin: newTrip.origin,
					destination: newTrip.destination,
					});

				return res.status(201).json({
					message: "Trip created and payment link generated!",
					trip: newTrip,
					paymentUrl,
				});
			} catch (err) {
				console.error("❌ Failed to generate payment link:", err.message);
				return res.status(500).json({
					error: "Trip created but failed to generate payment link.",
					trip: newTrip,
				});
			}
		}

		// For cash
		return res.status(201).json({
			message: "Trip created successfully (cash payment)",
			trip: newTrip,
		});
	} catch (err) {
		console.error("Error in createTrip:", err.message);
		res.status(500).json({ error: "Failed to create trip request." });
	}
};

// Assign a driver to a trip
exports.assignDriver = async (req, res) => {
	const { tripId, driverId } = req.body;

	try {
		const trip = await Trip.findById(tripId);
		if (!trip || trip.status !== "pending") {
			return res
				.status(400)
				.json({ error: "Trip not available for assignment." });
		}

		const driver = await Driver.findById(driverId);
		if (!driver) {
			return res.status(404).json({ error: "Driver not found." });
		}

		trip.driver = driverId;
		trip.driverAcceptedLocation = {
			lat: driver.location.lat,
			lng: driver.location.lng,
		};
		trip.status = "accepted";
		await trip.save();

		res.status(200).json({
			message: "Driver assigned successfully!",
			trip,
		});
	} catch (err) {
		console.error("Error in assignDriver:", err.message);
		res.status(500).json({ error: "Failed to assign driver." });
	}
};

// Update trip status (e.g., completed, canceled)
exports.updateTripStatus = async (req, res) => {
	const { tripId, status } = req.body;

	if (!["accepted", "completed", "canceled"].includes(status)) {
		return res.status(400).json({ error: "Invalid status update." });
	}

	try {
		const trip = await Trip.findById(tripId);
		if (!trip) {
			return res.status(404).json({ error: "Trip not found." });
		}

		trip.status = status;
		if (status === "completed" && trip.paymentMethod === "cash") {
		trip.isPaid = true;
		trip.paymentDate = new Date();
		}
		await trip.save();
		res.status(200).json({
			message: "Trip status updated successfully!",
			trip,
		});
	} catch (err) {
		console.error("Error in updateTripStatus:", err.message);
		res.status(500).json({ error: "Failed to update trip status." });
	}
};

// Fetch trips for a user
exports.getUserTrips = async (req, res) => {
	try {
		const trips = await Trip.find({ user: req.user.id }).populate(
			"driver",
			"name phone"
		);
		res.status(200).json(trips);
	} catch (err) {
		console.error("Error in getUserTrips:", err.message);
		res.status(500).json({ error: "Failed to fetch user trips." });
	}
};

// Fetch trips for a driver
exports.getDriverTrips = async (req, res) => {
	try {
		const trips = await Trip.find({ driver: req.user.id }).populate(
			"user",
			"name phone"
		);
		res.status(200).json(trips);
	} catch (err) {
		console.error("Error in getDriverTrips:", err.message);
		res.status(500).json({ error: "Failed to fetch driver trips." });
	}
};

exports.deleteTrip = async (req, res) => {
	try {
		const { id } = req.params;
		const trip = await Trip.findByIdAndDelete(id);

		if (!trip) {
			return res.status(404).json({ error: "❌ Trip not found." });
		}

		res.status(200).json({ message: "✅ Trip deleted successfully!" });
	} catch (err) {
		console.error("🚨 Error deleting trip:", err.message);
		res.status(500).json({ error: "❌ Failed to delete trip." });
	}
};

exports.getActiveTrips = async (req, res) => {
	try {
		// ✅ Fetch only active trips (pending or accepted)
		const activeTrips = await Trip.find({
			status: { $in: ["pending", "accepted"] },
		}).populate("driver user", "name phone location");

		if (!activeTrips.length) {
			return res.status(404).json({ message: "No active trips found!" });
		}

		// ✅ Format the trips
		const formattedTrips = activeTrips.map((trip) => ({
			tripId: trip._id,
			origin: trip.origin,
			destination: trip.destination,
			status: trip.status,
			distance: trip.distanceInKm,
			fare: trip.fare,
			user: {
				name: trip.user?.name || "N/A",
				phone: trip.user?.phone || "N/A",
			},
			driver: {
				name: trip.driver?.name || "Unassigned",
				phone: trip.driver?.phone || "N/A",
				location: trip.driver?.location || null, // Should be { lat, lng }
			},
		}));

		res.status(200).json({ activeTrips: formattedTrips });
	} catch (err) {
		console.error("🚨 Error fetching active trips:", err.message);
		res.status(500).json({ error: "❌ Failed to fetch active trips." });
	}
};

exports.getTripById = async (req, res) => {
	try {
		const tripId = req.params.id;

		const trip = await Trip.findById(tripId).populate(
			"driver",
			"name phone location"
		);

		if (!trip) {
			return res.status(404).json({ error: "❌ Trip not found." });
		}

		res.status(200).json(trip);
	} catch (err) {
		console.error("🚨 Error fetching trip by ID:", err.message);
		res.status(500).json({ error: "❌ Failed to retrieve trip details." });
	}
};


exports.handleFawaterakWebhook = async (req, res) => {
	try {
		const { invoice_id, payment_status, customer_email, metadata } = req.body;

		// Optional: Log the payload
		console.log("🔔 Fawaterak Webhook Triggered:", req.body);

		if (payment_status !== "paid") {
			return res.status(200).json({ message: "Payment not completed, ignoring." });
		}

		const tripId = metadata?.tripId;
		if (!tripId) {
			return res.status(400).json({ error: "Missing tripId in metadata" });
		}

		const updatedTrip = await Trip.findByIdAndUpdate(
			tripId,
			{
				isPaid: true,
				paymentDate: new Date(),
				status: "confirmed",
			},
			{ new: true }
		);

		if (!updatedTrip) {
			return res.status(404).json({ error: "Trip not found" });
		}

		console.log("✅ Trip marked as paid:", updatedTrip._id);
		res.status(200).json({ message: "Trip payment updated" });
	} catch (err) {
		console.error("❌ Webhook error:", err.message);
		res.status(500).json({ error: "Server error while handling webhook" });
	}
};