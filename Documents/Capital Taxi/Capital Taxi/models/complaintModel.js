const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
	{
		trip: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Trip",
			required: true,
		}, // Associated trip
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		}, // User filing the complaint
		driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" }, // Driver associated with the trip
		description: { type: String, required: true }, // Details of the complaint
		status: {
			type: String,
			enum: ["pending", "resolved"],
			default: "pending",
		}, // Complaint status
		resolution: { type: String }, // Admin's resolution notes
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
