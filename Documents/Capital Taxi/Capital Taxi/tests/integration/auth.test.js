const request = require("supertest");
const app = require("../../app");

describe("Auth API Tests", () => {
	let token;

	beforeAll(async () => {
		await request(app).post("/api/auth/register").send({
			name: "Test User",
			username: "testuser",
			phone: "1234567891",
			email: "testuser@example.com",
			password: "password123",
			role: "user",
		});
	});

	test("Login user", async () => {
		const res = await request(app).post("/api/auth/login").send({
			email: "testuser@example.com",
			password: "password123",
			role: "user",
		});
		expect(res.statusCode).toBe(200);
		expect(res.body.token).toBeDefined();
	});

	test("Login should fail with incorrect password", async () => {
		const res = await request(app).post("/api/auth/login").send({
			email: "testuser@example.com",
			password: "wrongpassword",
		});

		expect(res.statusCode).toBe(400);
	});
});
