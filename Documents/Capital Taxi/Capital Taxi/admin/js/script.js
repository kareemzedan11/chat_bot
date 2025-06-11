async function login() {
	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;

	try {
		const res = await fetch("http://localhost:5000/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password, role: "admin" }), // ✅ Specify role
		});

		const data = await res.json();

		if (res.ok) {
			localStorage.setItem("adminToken", data.token); // ✅ Store JWT token
			window.location.href = "dashboard.html"; // ✅ Redirect to admin dashboard
		} else {
			alert("❌ " + data.error);
		}
	} catch (error) {
		alert("🚨 Network error: " + error.message);
	}
}
