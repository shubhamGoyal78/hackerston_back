// server.js

// Importing required modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Importing the functions to handle different routes
const { storeUserInfo } = require("./store_userinfo");
const { loginCheck } = require("./login_check");
const { postCardInfo } = require("./store_cardinfo");
const { fetchAllCards } = require("./fetch_cardinfo");
const { postCardDetails } = require("./post_card_details"); // New post_card_details route
const { fetchCardDetails } = require("./fetch_carddetails");

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS to allow all origins
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to register a user
app.post("/api/register", storeUserInfo); // Endpoint for user registration

// Route for login check
app.post("/login", loginCheck);

// Route to fetch all cards
app.get("/fetch_card", fetchAllCards); // Fetch all cards

// Route to store card information
app.post("/store_card", postCardInfo); // Endpoint to post card information

// Route to post card details (for working_video_link, download_links, etc.)
app.post("/store_card_details", postCardDetails); // Endpoint for posting card details
app.get("/fetch_card_details/:id", fetchCardDetails);

// Starting the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
