const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Driver = require("../models/driverModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { jwtSecret, jwtExpiry } = require("../config/appConfig");

exports.register = async (req, res) => {
	try {
		const { name, username, phone, email, password, role } = req.body;

		if (!name || !username || !phone || !email || !password || !role) {
			console.error("🚨 Missing required fields:", req.body);
			return res.status(400).json({ error: "All fields are required." });
		}

		// ✅ Check if account already exists (Driver or User)
		const existingAccount = await (role === "driver"
			? Driver.findOne({ $or: [{ email }, { phone }] })
			: User.findOne({ $or: [{ email }, { phone }] }));

		if (existingAccount) {
			console.error("🚨 Account already exists!", email);
			return res.status(400).json({ error: "Account already exists!" });
		}

		// ✅ If registering as a driver, ensure required documents exist
		if (role === "driver") {
			const files = req.files;
			if (
				!files?.nationalIdFront ||
				!files?.nationalIdBack ||
				!files?.licenseFront ||
				!files?.licenseBack ||
				!files?.carLicenseFront ||
				!files?.carLicenseBack
			) {
				return res.status(400).json({
					error: "Required documents (front & back) are missing.",
				});
			}

			// ✅ Extract uploaded file paths
			const driverDocs = {
				nationalIdFront: files.nationalIdFront[0]?.path || "",
				nationalIdBack: files.nationalIdBack[0]?.path || "",
				licenseFront: files.licenseFront[0]?.path || "",
				licenseBack: files.licenseBack[0]?.path || "",
				carLicenseFront: files.carLicenseFront[0]?.path || "",
				carLicenseBack: files.carLicenseBack[0]?.path || "",
			};

			// ✅ Save driver with document paths
			const driver = new Driver({
				name,
				username,
				phone,
				email,
				password,
				...driverDocs,
			});
			await driver.save();

			return res.status(201).json({
				message: "Driver registered successfully!",
				user: driver, // ✅ Include driver data in response
			});
		} else {
			// ✅ Save regular user
			const user = new User({ name, username, phone, email, password });
			await user.save();

			return res.status(201).json({
				message: "User registered successfully!",
				user, // ✅ Include user data in response
			});
		}
	} catch (err) {
		console.error("🚨 Error in register:", err.message);
		res.status(500).json({
			error: "Internal server error. Please try again later.",
		});
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password, role } = req.body;

		if (!email || !password || !role) {
			return res.status(400).json({
				error: "Email, password, and role are required.",
			});
		}

		// ✅ Determine which model to query based on role
		let account;
		if (role === "admin") {
			account = await Admin.findOne({ email });
		} else if (role === "driver") {
			account = await Driver.findOne({ email });
		} else {
			account = await User.findOne({ email });
		}

		// ❌ If no account is found, return an error
		if (!account) {
			return res.status(400).json({ error: "Invalid credentials!" });
		}

		// ✅ Compare password
		const isMatch = await bcrypt.compare(password, account.password);
		if (!isMatch) {
			return res.status(400).json({ error: "Invalid credentials!" });
		}

		// ✅ Generate JWT token
		const token = jwt.sign({ id: account._id, role }, jwtSecret, {
			expiresIn: jwtExpiry,
		});

		// ✅ Send success response based on role
		res.status(200).json({
			message: `${
				role.charAt(0).toUpperCase() + role.slice(1)
			} login successful!`,
			token,
			account: {
				id: account._id,
				name: account.name,
				username: account.username || null,
				email: account.email,
				phone: account.phone || null,
				...(role === "driver" && { balance: account.balance }),
			},
		});
	} catch (err) {
		console.error("Error in login:", err.message);
		res.status(500).json({
			error: "Internal server error. Please try again later.",
		});
	}
};
