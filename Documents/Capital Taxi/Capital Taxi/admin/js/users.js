async function fetchUsers() {
	const token = localStorage.getItem("adminToken");
	if (!token) {
		window.location.href = "login.html";
		return;
	}

	try {
		const res = await fetch("http://localhost:5000/api/admin/users", {
			headers: { Authorization: `Bearer ${token}` },
		});

		const users = await res.json();
		const tableBody = document.querySelector("#usersTable tbody");
		tableBody.innerHTML = "";

		users.forEach((user) => {
			const row = `<tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>
                    <button class="edit-btn" onclick="editUser('${user._id}', '${user.name}', '${user.email}', '${user.phone}')">✏️ Edit</button>
                    <button class="delete-btn" onclick="deleteUser('${user._id}')">❌ Delete</button>
                </td>
            </tr>`;
			tableBody.innerHTML += row;
		});
	} catch (error) {
		alert("🚨 Failed to fetch users: " + error.message);
	}
}

function editUser(id, name, email, phone) {
	document.getElementById("editName").value = name;
	document.getElementById("editEmail").value = email;
	document.getElementById("editPhone").value = phone;
	document.getElementById("editUserModal").style.display = "block";
	window.currentUserId = id;
}

async function saveUser() {
	const id = window.currentUserId;
	const token = localStorage.getItem("adminToken");
	const name = document.getElementById("editName").value;
	const email = document.getElementById("editEmail").value;
	const phone = document.getElementById("editPhone").value;

	try {
		await fetch(`http://localhost:5000/api/admin/users/${id}`, {
			method: "PUT",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name, email, phone }),
		});

		alert("✅ User updated!");
		fetchUsers();
		closeEditModal();
	} catch (error) {
		alert("🚨 Error: " + error.message);
	}
}

function closeEditModal() {
	document.getElementById("editUserModal").style.display = "none";
}

async function deleteUser(userId) {
	const token = localStorage.getItem("adminToken");

	if (
		!confirm(
			"⚠️ Are you sure you want to delete this user? This action cannot be undone."
		)
	) {
		return;
	}

	try {
		const response = await fetch(
			`http://localhost:5000/api/admin/user/${userId}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (response.ok) {
			alert("✅ User deleted successfully!");
			location.reload();
		} else {
			alert("❌ Failed to delete user.");
		}
	} catch (error) {
		alert("🚨 Error: " + error.message);
	}
}

fetchUsers();
