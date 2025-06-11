const { fileComplaint } = require("../../controllers/complaintController");
const mongoose = require("mongoose");
test("User should be able to file a complaint", async () => {
	const req = {
		user: { id: new mongoose.Types.ObjectId() },
		body: {
			tripId: new mongoose.Types.ObjectId(),
			description: "Driver was rude",
		},
	};
	const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

	await fileComplaint(req, res);
	expect(res.status).toHaveBeenCalledWith(201);
});
