const request = require("supertest");
const app = require("../../app");
describe("User Profile API Tests", () => {
	let token;

	beforeAll(async () => {
		const loginRes = await request(app).post("/api/auth/login").send({
			email: "testuser@example.com",
			password: "password123",
			role: "User",
		});
		token = loginRes.body.token;
	});

	test("Get user profile", async () => {
		const res = await request(app)
			.get("/api/users/profile")
			.set("Authorization", `Bearer ${token}`);

		expect(res.statusCode).toBe(200);
	});

	test("Update user profile", async () => {
		const res = await request(app)
			.put("/api/users/profile")
			.set("Authorization", `Bearer ${token}`) // ✅ Use token
			.send({ name: "Updated Name" });

		expect(res.statusCode).toBe(200); // ✅ Should return 200 now
		expect(res.body.name).toBe("Updated Name");
	});
});
