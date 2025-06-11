async function fetchDrivers() {
	const token = localStorage.getItem("adminToken");
	if (!token) {
		alert("❌ Unauthorized! Please log in.");
		window.location.href = "login.html";
		return;
	}

	try {
		const res = await fetch("http://localhost:5000/api/admin/drivers", {
			headers: { Authorization: `Bearer ${token}` },
		});

		const drivers = await res.json();
		const tableBody = document.querySelector("#driversTable tbody");
		tableBody.innerHTML = "";

		drivers.forEach((driver) => {
			const actionButtons = `
				<button class="edit-btn" onclick="openEditModal('${driver._id}', '${
				driver.name
			}', '${driver.email}', '${driver.phone}')">✏️ Edit</button>
				<button class="delete-btn" onclick="deleteDriver('${
					driver._id
				}')">🗑 Delete</button>
				${`<button class="penalize-btn" onclick="penalizeDriver('${driver._id}')">⚠️ Penalize</button>`}
			`;

			const row = `<tr>
                <td>${driver.name}</td>
                <td>${driver.email}</td>
                <td>${driver.phone}</td>
                <td>${driver.balance}</td>
                <td>${actionButtons}</td>
            </tr>`;
			tableBody.innerHTML += row;
		});
	} catch (error) {
		alert("🚨 Failed to fetch drivers: " + error.message);
	}
}

// ✅ Open Edit Modal
function openEditModal(id, name, email, phone) {
	document.getElementById("editDriverModal").style.display = "flex";
	document.getElementById("editDriverId").value = id;
	document.getElementById("editName").value = name;
	document.getElementById("editEmail").value = email;
	document.getElementById("editPhone").value = phone;
}

// ✅ Close Edit Modal
function closeEditModal() {
	document.getElementById("editDriverModal").style.display = "none";
}

// ✅ Save Edited Driver
async function saveDriver() {
	const id = document.getElementById("editDriverId").value;
	const name = document.getElementById("editName").value;
	const email = document.getElementById("editEmail").value;
	const phone = document.getElementById("editPhone").value;
	const token = localStorage.getItem("adminToken");

	try {
		const res = await fetch(
			`http://localhost:5000/api/admin/driver/${id}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ name, email, phone }),
			}
		);

		if (res.ok) {
			alert("✅ Driver updated successfully!");
			closeEditModal();
			fetchDrivers();
		} else {
			alert("❌ Failed to update driver.");
		}
	} catch (error) {
		alert("🚨 Error: " + error.message);
	}
}

// ✅ Delete Driver Function
async function deleteDriver(driverId) {
	const token = localStorage.getItem("adminToken");

	if (
		!confirm(
			"⚠️ Are you sure you want to delete this driver? This action cannot be undone."
		)
	) {
		return;
	}

	try {
		const res = await fetch(
			`http://localhost:5000/api/admin/driver/${driverId}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (res.ok) {
			alert("✅ Driver deleted successfully!");
			fetchDrivers();
		} else {
			alert("❌ Failed to delete driver.");
		}
	} catch (error) {
		alert("🚨 Error: " + error.message);
	}
}

// ✅ Penalize Driver
async function penalizeDriver(driverId) {
	const token = localStorage.getItem("adminToken");
	const penaltyPercentage = prompt("Enter penalty percentage (e.g., 10):");

	if (!penaltyPercentage) return;

	try {
		const res = await fetch(
			"http://localhost:5000/api/admin/penalize-driver",
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ driverId, penaltyPercentage }),
			}
		);

		if (res.ok) {
			alert("✅ Driver penalized!");
			fetchDrivers();
		} else {
			alert("❌ Failed to penalize driver.");
		}
	} catch (error) {
		alert("🚨 Error: " + error.message);
	}
}

// Fetch drivers when the page loads
fetchDrivers();
