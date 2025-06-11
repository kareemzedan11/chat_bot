let map;
let markers = {};
let lines = {}; 

async function initMap() {
	map = L.map("map").setView([30.0444, 31.2357], 12);

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: "© OpenStreetMap Contributors",
	}).addTo(map);

	await fetchActiveTrips();
	setInterval(fetchActiveTrips, 5000);
}

async function initMap() {
	map = L.map("map").setView([30.0444, 31.2357], 12);

	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
		attribution: "© OpenStreetMap Contributors",
	}).addTo(map);

	await fetchActiveTrips();
	setInterval(fetchActiveTrips, 5000);
}

async function fetchActiveTrips() {
	try {
		const res = await fetch("http://localhost:5000/api/trips/active-trips");
		const data = await res.json();

		for (const id in lines) {
			lines[id].forEach((line) => map.removeLayer(line));
		}
		lines = {};

		if (data.activeTrips) {
			data.activeTrips.forEach(async (trip) => {
				const driverId = trip.driver._id;
				const { lat, lng } = trip.driver.location;
				const [originLat, originLng] = trip.origin
					.split(",")
					.map(Number);
				const [destLat, destLng] = trip.destination
					.split(",")
					.map(Number);

				// 🚗 Driver Marker
				if (markers[driverId]) {
					markers[driverId].setLatLng([lat, lng]);
				} else {
					markers[driverId] = L.marker([lat, lng]).addTo(map)
						.bindPopup(`
							🚗 <b>Driver:</b> ${trip.driver.name}<br>
							☎️ ${trip.driver.phone}<br>
							📍 <b>Status:</b> ${trip.status}`);
				}

				// 📍 Origin Marker
				const originMarker = L.marker([originLat, originLng], {
					icon: L.icon({
						iconUrl:
							"https://cdn-icons-png.flaticon.com/512/684/684908.png",
						iconSize: [24, 24],
					}),
				})
					.addTo(map)
					.bindTooltip("📍 Origin");

				// 🏁 Destination Marker
				const destinationMarker = L.marker([destLat, destLng], {
					icon: L.icon({
						iconUrl:
							"https://cdn-icons-png.flaticon.com/512/149/149060.png",
						iconSize: [24, 24],
					}),
				})
					.addTo(map)
					.bindTooltip("🏁 Destination");

				// 🟢 Line from Driver → Origin 
				const pickupRouteRes = await fetch(
					`http://localhost:5000/api/trips/get-directions?origin=${lat},${lng}&destination=${originLat},${originLng}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem(
								"adminToken"
							)}`,
						},
					}
				);

				const pickupRouteData = await pickupRouteRes.json();

				if (pickupRouteData?.points) {
					const decodedPickupCoords = polyline.decode(
						pickupRouteData.points
					);
					const pickupLatLngs = decodedPickupCoords.map(
						([lat, lng]) => [lat, lng]
					);

					const toPickup = L.polyline(pickupLatLngs, {
						color: "#28a745",
						weight: 3,
						dashArray: "5, 6",
					}).addTo(map);

					lines[driverId] = lines[driverId] || [];
					lines[driverId].push(toPickup);
				}

				// 🔵 Route from Origin → Destination 
				const routeRes = await fetch(
					`http://localhost:5000/api/trips/get-directions?origin=${originLat},${originLng}&destination=${destLat},${destLng}`,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem(
								"adminToken"
							)}`,
						},
					}
				);
				const routeData = await routeRes.json();

				if (routeData?.points) {
					const decodedCoords = polyline.decode(routeData.points);
					const latLngs = decodedCoords.map(([lat, lng]) => [
						lat,
						lng,
					]);

					const tripRoute = L.polyline(latLngs, {
						color: "#0077ff",
						weight: 4,
					}).addTo(map);

					lines[driverId] = [toPickup, tripRoute];
				}
			});
		}
	} catch (err) {
		console.error("🚨 Error fetching trips:", err.message);
	}
}

window.onload = initMap;
