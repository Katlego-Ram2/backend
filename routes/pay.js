const express = require("express");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// Create an order
router.post("/create-order", async (req, res) => {
  try {
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString("base64");

    const response = await fetch(`${process.env.PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD", // change if needed
              value: "11.00", // can be dynamic from req.body
            },
          },
        ],
      }),
    });

    const order = await response.json();
    res.json(order);
  } catch (err) {
    console.error("❌ Error creating PayPal order:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Capture payment for an order
router.post("/capture-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
    ).toString("base64");

    const response = await fetch(
      `${process.env.PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`,
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Error capturing PayPal order:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router; // ✅ CommonJS export
