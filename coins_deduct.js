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
    await client.connect(); // Ensure the client is connected
    const db = client.db("Hackerston");
    return db.collection("users");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw error;
  }
}

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

    // Find the user using `_id`
    const user = await usersCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentCoins = user.coins || 0;

    if (currentCoins < amount) {
      return res.status(400).json({ message: "Insufficient coins" });
    }

    // Deduct coins using an atomic operation
    const result = await usersCollection.updateOne(
      { _id: userId },
      { $inc: { coins: -amount } }
    );

    if (result.modifiedCount === 1) {
      let referralUserUpdated = null;

      // Check if deduction is above 40 and user has a referral_user
      if (amount > 40 && user.referral_user) {
        // Ensure referral is only counted once
        if (!user.referral_successful) {
          // Increment successful_count of referral user by 1
          await usersCollection.updateOne(
            { _id: user.referral_user },
            { $inc: { successful_count: 1 } }
          );

          // Mark this user's referral as successful
          await usersCollection.updateOne(
            { _id: userId },
            { $set: { referral_successful: true } }
          );

          // Fetch updated referral user data
          referralUserUpdated = await usersCollection.findOne({
            _id: user.referral_user,
          });
        }
      }

      return res.status(200).json({
        message: "Coins deducted successfully",
        deducted: amount,
        referral_user: referralUserUpdated
          ? {
              _id: referralUserUpdated._id,
              successful_count: referralUserUpdated.successful_count,
            }
          : null,
      });
    } else {
      throw new Error("Failed to deduct coins");
    }
  } catch (error) {
    console.error("Error deducting coins:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    // Close the client after the operation
    await client.close();
  }
}

module.exports = { deductCoins };
