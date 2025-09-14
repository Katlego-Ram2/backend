// db.js
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Load .env

// ------------------------
// Debug: print loaded env variables
// ------------------------
console.log("🔹 DB_HOST:", process.env.DB_HOST);
console.log("🔹 DB_PORT:", process.env.DB_PORT);
console.log("🔹 DB_USER:", process.env.DB_USER);
console.log("🔹 DB_NAME:", process.env.DB_NAME);
console.log("🔹 DB_SSL_CERT:", process.env.DB_SSL_CERT);

// ------------------------
// Handle SSL if provided
// ------------------------
let sslOptions = undefined;
if (process.env.DB_SSL_CERT) {
  const sslPath = path.join(__dirname, process.env.DB_SSL_CERT);
  if (fs.existsSync(sslPath)) {
    sslOptions = { ca: fs.readFileSync(sslPath) };
    console.log("🔹 Using SSL certificate at:", sslPath);
  } else {
    console.warn("⚠️ SSL certificate file not found at", sslPath);
  }
}

// ------------------------
// Create MySQL pool
// ------------------------
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "seedwayagridb",
  ssl: sslOptions,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ------------------------
// Test connection
// ------------------------
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ MySQL pool connected!");
    conn.release(); // release connection back to pool
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
  });

module.exports = pool;
