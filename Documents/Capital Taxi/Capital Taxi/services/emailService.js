const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	service: "hotmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

const sendEmail = async (to, subject, text) => {
	try {
		const mailOptions = {
			from: process.env.EMAIL_USER,
			to,
			subject,
			text,
		};

		const response = await transporter.sendMail(mailOptions);
		console.log("📧 Email Sent:", response.messageId);
		return response;
	} catch (err) {
		console.error("❌ Error sending email:", err.message);
	}
};

module.exports = { sendEmail };
