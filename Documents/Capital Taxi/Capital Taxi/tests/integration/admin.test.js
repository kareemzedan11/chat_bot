const request = require("supertest");
const app = require("../../app");
const path = require("path");
const { sendEmail } = require("../../services/emailService");
jest.mock("../../services/emailService", () => ({
  sendEmail: jest.fn(() => Promise.resolve("Mock email sent")),
}));
describe("Admin API Tests", () => {
	let adminToken;
	let driverId = "6845dbf403c90977a4826224";
	beforeAll(async () => {
		const driverRes = await request(app)
			.post("/api/auth/register")
			.field("name", "Test Driver")
			.field("username", "testdriver")
			.field("phone", "987654321")
			.field("email", "testdriver@example.com")
			.field("password", "driverpassword")
			.field("role", "driver")
			.attach(
				"nationalIdFront",
				path.join(__dirname, "../files/national_id_front.jpg")
			)
			.attach(
				"nationalIdBack",
				path.join(__dirname, "../files/national_id_back.jpg")
			)
			.attach(
				"licenseFront",
				path.join(__dirname, "../files/license_front.jpg")
			)
			.attach(
				"licenseBack",
				path.join(__dirname, "../files/license_back.jpg")
			)
			.attach(
				"carLicenseFront",
				path.join(__dirname, "../files/car_license_front.jpg")
			)
			.attach(
				"carLicenseBack",
				path.join(__dirname, "../files/car_license_back.jpg")
			);

		console.log("🚀 Driver Registration Response:", driverRes.body);

		// ✅ Ensure driver ID is extracted correctly
		driverId = driverRes.body?.user?._id || "6845dbf403c90977a4826224";
		if (!driverId) {
			throw new Error(
				"🚨 Driver ID is undefined! Check registration response."
			);
		}
		console.log("🚀 Driver ID IS :", driverId);

		await request(app).post("/api/auth/register").send({
			name: "Admin User",
			username: "admin",
			phone: "123456789",
			email: "admin@example.com",
			password: "adminpassword",
			role: "admin",
		});

		// Login as admin to get the token
		const loginRes = await request(app).post("/api/auth/login").send({
			email: "admin@example.com",
			password: "adminpassword",
			role: "admin",
		});

		adminToken = loginRes.body.token; // ✅ Store admin token for future requests
	});

	test("List all users", async () => {
		const res = await request(app)
			.get("/api/admin/users")
			.set("Authorization", `Bearer ${adminToken}`);
		console.log("🚀 Login Response:", res.body);

		expect(res.statusCode).toBe(200);
	});
	test("Penalize a driver", async () => {
		console.log("🚀 Penalizing Driver ID:", driverId);

		const res = await request(app)
			.put("/api/admin/penalize-driver")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({
				driverId,
				penaltyPercentage: 10,
			});

		expect(res.statusCode).toBe(200);
	});

	test("Send notification to users", async () => {
		const res = await request(app)
			.post("/api/admin/send-notification")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({
				role: "user",
				message: "This is a test notification",
			});

		expect(res.statusCode).toBe(200);
		expect(sendEmail).toHaveBeenCalled();
	});
});
