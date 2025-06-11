module.exports = {
	jwtSecret: process.env.JWT_SECRET || "default_jwt_secret",
	jwtExpiry: "1d",
	emailService: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
	currency: "EGP",
	fuelCostPerLiter: 15, // Fuel cost in Egyptian Pounds
	carFuelEfficiency: 12, // Kilometers per liter
	baseFare: 10, // Flat fee for trips
};
