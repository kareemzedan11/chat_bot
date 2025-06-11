require("dotenv").config();

module.exports = {
	googleMaps: {
		baseUrl: "https://maps.googleapis.com/maps/api",
		apiKey: process.env.GOOGLE_MAPS_API_KEY, // Only use if needed
	},
	graphHopper: {
		baseUrl: "https://graphhopper.com/api/1",
		apiKey: process.env.GRAPH_HOPPER_API_KEY, // ✅ Free alternative to Google Maps
	},
};
