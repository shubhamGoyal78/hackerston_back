// Import required modules
const express = require("express");
const http = require("http"); // ✅ Added missing import
const bodyParser = require("body-parser");
const cors = require("cors");

// Import route functions
const { postUserImages } = require("./postimages_user");
const { addOneCoin } = require("./add_one_coins");
const { fetchTelegramLink } = require("./telegram_link");
const { fetchPlaystoreLink } = require("./playstore_link");
const { blockApp } = require("./block_app");

const { loginOrSignup } = require("./login_signup_page");
const { postCardInfo } = require("./store_cardinfo");
const { fetchAllCards } = require("./fetch_cardinfo");
const { postCardDetails } = require("./post_card_details");
const { fetchCardDetails } = require("./fetch_carddetails");
const { fetchCoins } = require("./fetch_coins");
const { addCoins } = require("./get_coin");
const { fetchDownloadCoins } = require("./fetch_download_coins");
const { deductCoins } = require("./coins_deduct");
const { postAppDetails } = require("./post_app_details");
const { fetchAppDetails } = require("./fetch_app_details");
const { postAppThumbnail } = require("./post_app_thumbnail");
const { fetchAllAppInfo } = require("./fetch_app_thumbnail");
const { applyReferralCode } = require("./apply_code");
const { checkAppliedCoupon } = require("./check_apply_coupon");
const { fetchReferDetails } = require("./fetch_referdetails");
const { sendMessage, fetchChatHistory } = require("./feedback_chat");

// Initialize Express app
const app = express();
const server = http.createServer(app); // ✅ Creating HTTP server properly

// Middleware setup
app.use(cors()); // ✅ Ensure CORS is set before defining routes
app.use(bodyParser.json());

// API Routes

// Authentication
app.post("/api/auth", loginOrSignup);

// Card management
app.get("/fetch_card", fetchAllCards);
app.post("/store_card", postCardInfo);
app.post("/store_card_details", postCardDetails);
app.get("/fetch_card_details/:id", fetchCardDetails);

// Coins management
app.get("/fetch_coins/:userId", fetchCoins);
app.get("/add-coins/:userId", addCoins);
app.get("/fetch_download_coins", fetchDownloadCoins);
app.post("/deductCoins/:userId", deductCoins);
app.post("/add-one-coin/:userId", addOneCoin);

// App management
app.post("/app-details", postAppDetails);
app.get("/app-details/:id", fetchAppDetails);
app.post("/app-thumbnail", postAppThumbnail);
app.get("/api/apps", fetchAllAppInfo);
app.post("/block-app", blockApp);

// Referral and Coupons
app.post("/apply-coupon/:userId", applyReferralCode);
app.get("/check-coupon/:userId", checkAppliedCoupon);
app.get("/fetch_referdetails/:userId", fetchReferDetails);

// User images
app.post("/postUserImages/:userid", postUserImages);

// External links
app.get("/api/telegram-link", fetchTelegramLink);
app.get("/api/playstore-link", fetchPlaystoreLink);

// Chat routes
app.post("/chat/send", sendMessage); // Send message (user/admin)
app.get("/chat/history/:userId", fetchChatHistory); // Fetch chat history

// Start server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
