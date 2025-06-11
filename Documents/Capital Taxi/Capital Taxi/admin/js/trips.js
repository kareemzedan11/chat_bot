let tripMap;

async function openTripDetailsModal(tripId) {
	document.getElementById("tripDetailsModal").style.display = "block";

	const token = localStorage.getItem("adminToken");

	const res = await fetch(`http://localhost:5000/api/trips/${tripId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	const { origin, destination, driverAcceptedLocation } = await res.json();

	const [originLat, originLng] = origin.split(",").map(Number);
	const [destLat, destLng] = destination.split(",").map(Number);
	const { lat: driverLat, lng: driverLng } = driverAcceptedLocation;

	if (tripMap) {
		tripMap.remove();
	}

	tripMap = L.map("map").setView([originLat, originLng], 13);
	L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
		tripMap
	);

	// 📍 Markers
	L.marker([driverLat, driverLng])
		.addTo(tripMap)
		.bindTooltip("🚗 Driver Start");
	L.marker([originLat, originLng]).addTo(tripMap).bindTooltip("📍 Pickup");
	L.marker([destLat, destLng]).addTo(tripMap).bindTooltip("🏁 Drop-off");

	// 1️⃣ Driver ➝ Pickup 
	try {
		const driverToPickupRes = await fetch(
			`http://localhost:5000/api/trips/get-directions?origin=${driverLat},${driverLng}&destination=${originLat},${originLng}`,
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		const driverRoute = await driverToPickupRes.json();
		const decoded = polyline.decode(driverRoute.points);
		const latLngs = decoded.map(([lat, lng]) => L.latLng(lat, lng));
		L.polyline(latLngs, {
			color: "#28a745",
			weight: 4,
			dashArray: "5, 5",
		}).addTo(tripMap);
	} catch (err) {
		console.warn("❌ Failed to fetch Driver ➝ Pickup route:", err.message);
	}

	// 2️⃣ Pickup ➝ Drop-off 
	try {
		const tripRouteRes = await fetch(
			`http://localhost:5000/api/trips/get-directions?origin=${originLat},${originLng}&destination=${destLat},${destLng}`,
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		const tripRoute = await tripRouteRes.json();
		const decoded = polyline.decode(tripRoute.points);
		const latLngs = decoded.map(([lat, lng]) => L.latLng(lat, lng));
		L.polyline(latLngs, { color: "#0077ff", weight: 4 }).addTo(tripMap);
	} catch (err) {
		console.warn(
			"❌ Failed to fetch Pickup ➝ Drop-off route:",
			err.message
		);
	}
}

function closeTripDetailsModal() {
	document.getElementById("tripDetailsModal").style.display = "none";
}
async function fetchTrips() {
	const token = localStorage.getItem("adminToken");
	if (!token) {
		window.location.href = "login.html";
		return;
	}

	try {
		const res = await fetch("http://localhost:5000/api/admin/trips", {
			headers: { Authorization: `Bearer ${token}` },
		});

		const trips = await res.json();
		const tableBody = document.querySelector("#tripsTable tbody");
		tableBody.innerHTML = "";

		trips.forEach((trip) => {
			const row = `<tr>
                <td>${trip.user?.name || "Unknown User"}</td>
                <td>${trip.driver?.name || "Not Assigned"}</td>
                <td>${trip.destination}</td>
                <td>${trip.fare} EGP</td>
                <td>${trip.status}</td>
                <td>
                    <button class="delete-btn" onclick="deleteTrip('${
						trip._id
					}')">❌ Delete</button>

                  <button class="details-btn" onclick="openTripDetailsModal('${
						trip._id
					}')">📍 Trip Details</button>

				</td>
            </tr>`;
			tableBody.innerHTML += row;
		});
	} catch (error) {
		alert("🚨 Failed to fetch trips: " + error.message);
	}
}
async function deleteTrip(tripId) {
	const token = localStorage.getItem("adminToken");

	try {
		const res = await fetch(`http://localhost:5000/api/trips/${tripId}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});

		if (res.ok) {
			alert("✅ Trip deleted successfully!");
			fetchTrips();
		} else {
			alert("❌ Failed to delete trip.");
		}
	} catch (error) {
		alert("🚨 Error: " + error.message);
	}
}

fetchTrips();
