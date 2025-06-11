const { graphHopper } = require("../config/apiConfig");

exports.getDirections = async (origin, destination) => {
	try {
		const fetch = (await import("node-fetch")).default;

		const url = `${graphHopper.baseUrl}/route?point=${origin}&point=${destination}&vehicle=car&locale=en&calc_points=true&key=${graphHopper.apiKey}`;

		const response = await fetch(url);
		const textData = await response.text();

		const data = JSON.parse(textData);

		if (!data.paths || data.paths.length === 0) {
			throw new Error("❌ No route found using GraphHopper.");
		}

		return {
			distance: data.paths[0].distance / 1000,
			duration: data.paths[0].time / 1000 / 60,
			points: data.paths[0].points,
		};
	} catch (err) {
		console.error("🚨 GraphHopper Error:", err.message);
		throw new Error("❌ Failed to fetch route. Please try again later.");
	}
};
