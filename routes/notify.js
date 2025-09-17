// routes/notify.js
const express = require("express");
const sendEmail = require("../mail.js");

const router = express.Router();


router.get("/test-email", async (req, res) => {
  const { to } = req.query;

  if (!to) {
    return res.status(400).send("Missing 'to' query parameter");
  }

  try {
    await sendEmail(
      to,
      "Test Email from Seedway Agric College",
      "This is a test email sent from our backend.",
      "<h3>This is a test email sent from <b>Seedway Agric College</b></h3>"
    );

    res.send(`✅ Test email sent to ${to}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to send test email");
  }
});

module.exports = router;
