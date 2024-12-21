// server.js

// Importing required modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import the storeUserInfo function
const { storeUserInfo } = require("./store_userinfo");

// Creating an express app
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors()); // Allow all origins

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to register a user

app.post("/api/register", storeUserInfo); // Endpoint for user registration
app.post("/login", loginCheck); // Endpoint for user login

// Starting the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
