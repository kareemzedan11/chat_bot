const mongoose = require("mongoose");
require("dotenv").config();

beforeAll(async () => {
	await mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
});

// afterEach(async () => {
// 	// Clears all collections to ensure tests start fresh
// 	const collections = Object.keys(mongoose.connection.collections);
// 	for (const collectionName of collections) {
// 		await mongoose.connection.collections[collectionName].deleteMany({});
// 	}
// });

afterAll(async () => {
	await mongoose.connection.close();
});
