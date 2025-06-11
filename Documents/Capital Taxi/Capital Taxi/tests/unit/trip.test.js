const { createTrip } = require("../../controllers/tripController");

test("Create trip request should return trip details", async () => {
	const req = {
	user: { id: "6845dbf56ee4579fb7dc340d" },  // your current user info
	body: {
		id: "6845dbf56ee4579fb7dc340d",  // add this line: user ID in body
		origin: "Cairo, Egypt",
		destination: "Giza, Egypt",
		paymentMethod: "cash",
		distanceInKm: "10",
		fare: 50,
	},
};
	const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

	await createTrip(req, res);
	expect(res.status).toHaveBeenCalledWith(201);
});
