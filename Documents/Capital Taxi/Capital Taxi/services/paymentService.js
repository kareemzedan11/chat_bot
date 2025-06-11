const axios = require("axios");

const { 
  FAWATERAK_API_KEY, 
  FAWATERAK_PROVIDER_KEY, 
  FAWATERAK_SUCCESS_URL, 
  FAWATERAK_ERROR_URL 
} = process.env;

exports.createPaymentLink = async ({ amount, clientName, clientEmail, tripId, origin, destination }) => {
  try {
    const [firstName = "First", lastName = "Last"] = clientName ? clientName.split(" ") : [];

    const cartItems = [
      {
        name: `Trip from ${origin} to ${destination}`,
        price: amount,
        quantity: 1,
      },
    ];

    const payload = {
      currency: "EGP",                     // required by API
      customer: {
        first_name: firstName,
        last_name: lastName,
        email: clientEmail,
      },
      cartItems,
      cartTotal: amount,
      success_url: `${FAWATERAK_SUCCESS_URL}/${tripId}`,
      error_url: `${FAWATERAK_ERROR_URL}/${tripId}`,
      provider: FAWATERAK_PROVIDER_KEY,
      metadata: { tripId },                // useful for webhook identification
    };

    const response = await axios.post(
      "https://app.fawaterk.com/api/v2/createInvoiceLink",
      payload,
      {
        headers: {
          Authorization: `Bearer ${FAWATERAK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data.url;
  } catch (err) {
    console.error("❌ Fawaterak Error:", err.response?.data || err.message);
    throw new Error("Failed to generate Fawaterak payment link.");
  }
};
