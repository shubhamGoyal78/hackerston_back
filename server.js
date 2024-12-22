// server.js

// Importing required modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import the storeUserInfo function
const { storeUserInfo } = require("./store_userinfo");
const { loginCheck } = require("./login_check");
const { postCardInfo } = require("./store_cardinfo");
const { fetchCardInfo } = require("./fetch_cardinfo");
// Creating an express app
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors()); // Allow all origins

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to register a user

app.post("/api/register", storeUserInfo); // Endpoint for user registration
app.post("/login", loginCheck);
app.get("/fetch_cards", fetchCardInfo);
app.post("/store_card", postCardInfo); // The route to post card information

// Starting the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
