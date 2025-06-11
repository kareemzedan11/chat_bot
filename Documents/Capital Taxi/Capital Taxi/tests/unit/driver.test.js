const {
	getProfile,
	viewBalance,
} = require("../../controllers/driverController");

test("View driver balance should return balance amount", async () => {
	const req = { user: { id: "6845dbf403c90977a4826224" } };
	const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

	await viewBalance(req, res);
	expect(res.status).toHaveBeenCalledWith(200);
});
