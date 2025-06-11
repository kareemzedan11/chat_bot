const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const driverSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		username: { type: String, required: true, unique: true },
		phone: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		profileImage: { type: String }, // URL to profile image

		// ✅ Store both front & back of National ID, Driver’s License, and Car License
		nationalIdFront: { type: String, required: true }, // URL to ID front image
		nationalIdBack: { type: String, required: true }, // URL to ID back image
		licenseFront: { type: String, required: true }, // URL to driver's license front image
		licenseBack: { type: String, required: true }, // URL to driver's license back image
		carLicenseFront: { type: String, required: true }, // URL to car license front image
		carLicenseBack: { type: String, required: true }, // URL to car license back image

		balance: { type: Number, default: 0 }, // Driver's earnings
		validUntil: { type: Date }, // Expiry date for account validity
		currentTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }], // Reference to active trips
		location: {
			lat: { type: Number, default: null },
			lng: { type: Number, default: null },
		},
	},
	{ timestamps: true }
);

driverSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});
module.exports = mongoose.model("Driver", driverSchema);
