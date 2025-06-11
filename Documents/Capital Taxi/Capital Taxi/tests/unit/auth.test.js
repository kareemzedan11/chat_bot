const { register } = require("../../controllers/authController");

test("Register new user should return success", async () => {
	const req = {
		body: {
			name: "Test User1123",
			username: "testuser1123",
			phone: "1234567891123",
			email: "testuser1123@example.com",
			password: "password123",
			role: "user",
		},
	};
	const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

	await register(req, res);

	// ✅ Allow additional properties using expect.objectContaining
	expect(res.status).toHaveBeenCalledWith(201);
	expect(res.json).toHaveBeenCalledWith(
		expect.objectContaining({
			message: "User registered successfully!",
		})
	);
});
