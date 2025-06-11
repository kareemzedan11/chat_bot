const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		username: { type: String, required: true, unique: true },
		phone: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		paymentMethods: [{ type: String }], // e.g., ["cash", "credit card"]
		profileImage: { type: String }, // URL to the profile image
		orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }], // Reference to trips
	},
	{ timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

module.exports = mongoose.model("User", userSchema);
