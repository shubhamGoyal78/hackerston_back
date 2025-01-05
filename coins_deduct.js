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
    if (!client.isConnected()) {
      await client.connect();
    }
    const db = client.db("Hackerston");
    return db.collection("users");
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

// API to deduct coins
async function deductCoins(req, res) {
  const userId = req.params.userId; // Extract userId from URL parameters
  const { amount } = req.body; // Extract deduction amount from request body

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid deduction amount" });
  }

  try {
    const usersCollection = await connectToUsersDb();

    // Find the user
    const user = await usersCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentCoins = user.coins || 0;

    if (currentCoins < amount) {
      return res.status(400).json({
        message: "Insufficient coins",
        currentCoins,
      });
    }

    // Deduct coins using atomic operation
    const result = await usersCollection.updateOne(
      { _id: userId },
      { $inc: { coins: -amount } }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({
        message: "Coins deducted successfully",
        deducted: amount,
        remainingCoins: currentCoins - amount,
      });
    } else {
      throw new Error("Failed to deduct coins");
    }
  } catch (error) {
    console.error("Error deducting coins:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { deductCoins };
