const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		driver: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Driver",
			default: null,
		},
		origin: { type: String, required: true },
		destination: { type: String, required: true },
		distanceInKm: { type: Number, required: true },
		fare: { type: Number, required: true },
		paymentMethod: { type: String, required: true },
		status: {
			type: String,
			enum: ["pending", "accepted", "completed", "canceled"],
			default: "pending",
		},
		rating: { type: Number, min: 1, max: 5 },
		complaint: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint" },
		driverAcceptedLocation: {
			type: {
				lat: { type: Number },
				lng: { type: Number },
			},
			default: null,
		},

		// 🔽 NEW PAYMENT FIELDS
		isPaid: {
			type: Boolean,
			default: false,
		},
		paymentDate: {
			type: Date,
		},
		paymentLink: {
			type: String,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
