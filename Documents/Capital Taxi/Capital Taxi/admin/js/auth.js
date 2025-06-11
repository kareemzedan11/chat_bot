// ✅ Check if the admin is authenticated
const token = localStorage.getItem("adminToken");

if (!token) {
	window.location.href = "login.html"; // Redirect to login if not authenticated
}

// ✅ Logout function
function logout() {
	localStorage.removeItem("adminToken"); // Remove JWT
	window.location.href = "login.html"; // Redirect to login page
}
