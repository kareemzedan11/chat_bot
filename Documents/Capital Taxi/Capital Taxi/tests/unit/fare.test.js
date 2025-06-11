const { calculateFare } = require("../../controllers/tripController");
jest.mock("../../services/googleMapsService", () => ({
	getDirections: jest.fn(() =>
		Promise.resolve({
			distance: 10, // Mocked 10 km distance
			duration: 15, // Mocked 15-minute duration
			points: "mocked_polyline_data",
		})
	),
}));

describe("Calculate Fare Tests", () => {
	test("Calculate trip fare correctly", async () => {
		// Mock request and response objects
		const req = {
			query: {
				origin: "30.033333,31.233334",
				destination: "29.960667,31.252547",
				paymentMethod: "cash",
			},
		};
		const res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		const next = jest.fn();

		// Call controller function
		await calculateFare(req, res, next);

		// Ensure the response status was 200
		expect(res.status).toHaveBeenCalledWith(200);

		// Extract response data
		const responseData = res.json.mock.calls[0][0];

		// Ensure fare and distance are correctly calculated
		expect(parseFloat(responseData.fare)).toBeGreaterThan(0);
		expect(responseData.route.distance).toBe(10); // Must match the mock
	});
});
