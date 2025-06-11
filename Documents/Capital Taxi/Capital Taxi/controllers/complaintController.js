const Complaint = require("../models/complaintModel");

// File a complaint
exports.fileComplaint = async (req, res) => {
	const { tripId, description } = req.body;

	try {
		const complaint = new Complaint({
			trip: tripId,
			user: req.user.id,
			description,
			status: "pending",
		});

		await complaint.save();
		res.status(201).json({ message: "Complaint filed successfully!" });
	} catch (err) {
		console.error("Error in fileComplaint:", err.message);
		res.status(500).json({ error: "Failed to file complaint." });
	}
};

// Get all complaints (Admin Only)
exports.getAllComplaints = async (req, res) => {
	try {
		const complaints = await Complaint.find()
			.populate("user", "name")
			.populate("trip");
		res.status(200).json(complaints);
	} catch (err) {
		console.error("Error in getAllComplaints:", err.message);
		res.status(500).json({ error: "Failed to retrieve complaints." });
	}
};

// Resolve a complaint
exports.resolveComplaint = async (req, res) => {
	const { complaintId, resolution } = req.body;

	try {
		const complaint = await Complaint.findById(complaintId);
		if (!complaint) {
			return res.status(404).json({ error: "Complaint not found." });
		}

		complaint.status = "resolved";
		complaint.resolution = resolution;
		await complaint.save();

		res.status(200).json({
			message: "Complaint resolved successfully!",
			complaint,
		});
	} catch (err) {
		console.error("Error in resolveComplaint:", err.message);
		res.status(500).json({ error: "Failed to resolve complaint." });
	}
};
