const { MongoClient } = require("mongodb");

// MongoDB connection URI and client setup
const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to the 'users' collection
async function connectToUsersDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston"); // Use the Hackerston database
    return db.collection("users"); // Return 'users' collection
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

// Function to deduct coins from a user's account
async function coinsUsed(req, res) {
  const userId = req.params.userId; // Extract userId from URL parameters
  const coinsToDeduct = 1; // Coins to deduct (set to 1 as per your request)

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const usersCollection = await connectToUsersDb(); // Connect to 'users' collection

    // Find the user by UUID (_id)
    const user = await usersCollection.findOne({ _id: userId });

    // If user does not exist
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has enough coins
    if (user.coins < coinsToDeduct) {
      return res.status(400).json({ message: "Insufficient coins" });
    }

    // Deduct the coins from the user's account
    const updatedCoins = user.coins - coinsToDeduct;
    await usersCollection.updateOne(
      { _id: userId },
      { $set: { coins: updatedCoins } }
    );

    // Return the updated coins value
    res.status(200).json({
      message: `1 coin deducted successfully`,
      coins: updatedCoins,
    });
  } catch (error) {
    console.error("Error deducting coins:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { coinsUsed };
