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
app.post("/register", async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Call the storeUserInfo function to store user data
  const result = await storeUserInfo(email, name, password);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  res.status(200).json({ message: result.success, user: result.user });
});

// Starting the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
