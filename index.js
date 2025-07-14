// functions/index.js
const functions = require("firebase-functions");
const cors = require("cors")({ origin: true }); // Allow all origins
const twilio = require("twilio"); // if you're using Twilio

exports.sendSMS = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { name, phone, items } = req.body;

      // Prepare message text (example)
      const msg = `Order from ${name.toUpperCase()} (${phone}):\n` +
                  items.map(i => `• ${i.quantity} x ${i.name}`).join("\n");

      // ✅ Send message via Twilio or other SMS API here

      // Example success response
      res.status(200).json({ success: true, message: "SMS sent." });
    } catch (err) {
      console.error("SMS Error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });
});
