const {
	getProfile,
	updateProfile,
} = require("../../controllers/userController");

const mongoose = require("mongoose");

test("Get user profile should return user data", async () => {
	const req = { user: { id: "6845dbf4af3a4bf1caffcade" } };
	const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

	await getProfile(req, res);
	expect(res.status).toHaveBeenCalledWith(200);
	expect(res.json).toBeDefined();
});
