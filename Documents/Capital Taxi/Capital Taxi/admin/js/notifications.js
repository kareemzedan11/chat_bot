async function sendNotification() {
	const token = localStorage.getItem("adminToken");
	const role = document.getElementById("role").value;
	const message = document.getElementById("message").value;

	if (!message.trim()) {
		alert("❌ Notification message cannot be empty!");
		return;
	}

	try {
		const res = await fetch(
			"http://localhost:5000/api/admin/send-notification",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ role, message }),
			}
		);

		if (res.ok) {
			alert("✅ Notification sent successfully!");
			document.getElementById("message").value = "";
			fetchNotifications();
		} else {
			alert("❌ Failed to send notification.");
		}
	} catch (error) {
		alert("🚨 Error: " + error.message);
	}
}

// ✅ Fetch notifications from DB
async function fetchNotifications() {
	const token = localStorage.getItem("adminToken");
	try {
		const res = await fetch(
			"http://localhost:5000/api/admin/notifications",
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		);

		const notifications = await res.json();
		const tableBody = document.querySelector("#notificationsTable tbody");
		tableBody.innerHTML = "";

		notifications.forEach((notification) => {
			const row = `<tr>
                <td>${notification.role}</td>
                <td>${notification.message}</td>
                <td>${new Date(notification.createdAt).toLocaleString()}</td>
            </tr>`;
			tableBody.innerHTML += row;
		});
	} catch (error) {
		alert("🚨 Failed to fetch notifications: " + error.message);
	}
}

// Fetch notifications on page load
fetchNotifications();
