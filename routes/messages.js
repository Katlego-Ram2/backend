const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(bodyParser.json());

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// -------------------- API ROUTES --------------------

// Send message from App -> WhatsApp
app.post("/api/send-message", async (req, res) => {
  const { message } = req.body;
  try {
    // Send to WhatsApp
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${process.env.USER_WHATSAPP_NUMBER}`,
      body: message,
    });

    // Optionally, emit to frontend
    io.emit("chatbot-message", { from: "user", text: message });

    res.json({ status: "sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Twilio webhook for incoming WhatsApp messages
app.post("/api/whatsapp-webhook", (req, res) => {
  const incomingMsg = req.body.Body;
  const fromNumber = req.body.From;

  console.log("Incoming WhatsApp message:", incomingMsg, fromNumber);

  // Optional: simple bot auto-reply
  let botReply = "Thanks for your message! We'll get back to you soon.";

  // Emit to connected clients (frontend chat)
  io.emit("chatbot-message", { from: "bot", text: botReply });

  // Reply back to WhatsApp automatically
  client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: fromNumber,
    body: botReply,
  });

  res.sendStatus(200);
});

// -------------------- SOCKET.IO --------------------
io.on("connection", (socket) => {
  console.log("User connected to chatbot socket");

  socket.on("send-message", async (msg) => {
    // Emit message to all users
    io.emit("chatbot-message", { from: "user", text: msg });

    // Optionally, forward to WhatsApp
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${process.env.USER_WHATSAPP_NUMBER}`,
      body: msg,
    });

    // Auto-reply from bot
    const botReply = "Hello! This is your chatbot. We received your message.";
    io.emit("chatbot-message", { from: "bot", text: botReply });
  });
});

// -------------------- SERVER --------------------
server.listen(5000, () => console.log("Chatbot server running on port 5000"));
