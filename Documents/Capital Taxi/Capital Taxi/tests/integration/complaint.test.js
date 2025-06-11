const request = require("supertest");
const app = require("../../app");

describe("Complaint API Tests", () => {
	let token;

	beforeAll(async () => {
		const loginRes = await request(app).post("/api/auth/login").send({
			email: "testuser@example.com",
			password: "password123",
			role: "user",
		});
		token = loginRes.body.token;
	});

	test("File a complaint", async () => {
		const res = await request(app)
			.post("/api/complaints/file")
			.set("Authorization", `Bearer ${token}`)
			.send({
				tripId: "60d5f9b8e8170c3a4c8e4d2f",
				description: "Driver was rude",
			});

		expect(res.statusCode).toBe(201);
	});
});
