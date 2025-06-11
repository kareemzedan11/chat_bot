async function fetchComplaints() {
	const token = localStorage.getItem("adminToken");
	if (!token) {
		window.location.href = "login.html";
		return;
	}

	try {
		const res = await fetch("http://localhost:5000/api/admin/complaints", {
			headers: { Authorization: `Bearer ${token}` },
		});

		const complaints = await res.json();
		const tableBody = document.querySelector("#complaintsTable tbody");
		tableBody.innerHTML = "";

		complaints.forEach((complaint) => {
			const row = `<tr>
                <td>${complaint.user.name}</td>
                <td>${complaint.driver?.name || "N/A"}</td>
                <td>${complaint.description}</td>
                <td>${complaint.status}</td>
                <td>
                    ${
						complaint.status === "pending"
							? `<button class="resolve-btn" onclick="resolveComplaint('${complaint._id}')">✅ Resolve</button>`
							: "Resolved ✅"
					}
                </td>
            </tr>`;
			tableBody.innerHTML += row;
		});
	} catch (error) {
		alert("🚨 Failed to fetch complaints: " + error.message);
	}
}

async function resolveComplaint(complaintId) {
	const token = localStorage.getItem("adminToken");

	try {
		const res = await fetch(
			`http://localhost:5000/api/admin/complaint/${complaintId}/resolve`,
			{
				method: "PUT",
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		if (res.ok) {
			alert("✅ Complaint resolved successfully!");
			fetchComplaints();
		} else {
			alert("❌ Failed to resolve complaint.");
		}
	} catch (error) {
		alert("🚨 Error: " + error.message);
	}
}

// Fetch complaints when page loads
fetchComplaints();
