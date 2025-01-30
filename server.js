// server.js

// Importing required modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Importing the functions to handle different routes
const { loginOrSignup } = require("./login_signup_page"); // Unified login/signup functionality
const { postCardInfo } = require("./store_cardinfo");
const { fetchAllCards } = require("./fetch_cardinfo");
const { postCardDetails } = require("./post_card_details"); // New post_card_details route
const { fetchCardDetails } = require("./fetch_carddetails");
const { fetchCoins } = require("./fetch_coins");
const { addCoins } = require("./get_coin");
const { fetchDownloadCoins } = require("./fetch_download_coins"); // Import fetchDownloadCoins function
const { deductCoins } = require("./coins_deduct"); // Import the deductCoins function
const { postAppDetails } = require("./post_app_details"); // Adjust the path as needed
const { fetchAppDetails } = require("./fetch_app_details"); // The newly created fetchAppDetails function

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS to allow all origins
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route for login or signup
app.post("/api/auth", loginOrSignup); // Unified login and signup endpoint

// Route to fetch all cards
app.get("/fetch_card", fetchAllCards); // Fetch all cards

// Route to store card information
app.post("/store_card", postCardInfo); // Endpoint to post card information
app.post("/deductCoins/:userId", deductCoins);
app.post("/app-details", postAppDetails);
app.get("/app-details/:id", fetchAppDetails);

// Route to post card details (for working_video_link, download_links, etc.)
app.post("/store_card_details", postCardDetails); // Endpoint for posting card details
app.get("/fetch_card_details/:id", fetchCardDetails);
app.get("/fetch_coins/:userId", fetchCoins);
app.get("/add-coins/:userId", addCoins);
app.get("/fetch_download_coins", fetchDownloadCoins); // New route for fetching download coins

// Starting the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
