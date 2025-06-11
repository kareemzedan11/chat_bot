const express = require("express");
const { register, login } = require("../controllers/authController");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
	"/register",
	upload.fields([
		{ name: "nationalIdFront", maxCount: 1 },
		{ name: "nationalIdBack", maxCount: 1 },
		{ name: "licenseFront", maxCount: 1 },
		{ name: "licenseBack", maxCount: 1 },
		{ name: "carLicenseFront", maxCount: 1 },
		{ name: "carLicenseBack", maxCount: 1 },
	]),
	register
);

router.post("/login", login);

module.exports = router;
