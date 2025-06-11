const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
	{
		role: { type: String, enum: ["user", "driver"], required: true }, // Who receives the notification
		message: { type: String, required: true }, // Notification content
		createdAt: { type: Date, default: Date.now }, // Timestamp
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
