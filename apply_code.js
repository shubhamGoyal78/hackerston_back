const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to the 'users' collection
async function connectToDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston");
    return db.collection("users");
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

// Function to apply a referral code
async function applyReferralCode(req, res) {
  try {
    const { userId } = req.params; // Get user ID from URL
    const { referralCode } = req.body; // Get referral code from request body

    if (!userId || !referralCode) {
      return res
        .status(400)
        .json({ message: "User ID and referral code are required" });
    }

    const usersCollection = await connectToDb();

    // Check if the user exists
    const user = await usersCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's document to include the applied referral code
    await usersCollection.updateOne(
      { _id: userId },
      { $set: { apply_code: referralCode } }
    );

    return res.status(200).json({
      message: "Referral code applied successfully",
      user: {
        _id: userId,
        email: user.email,
        referral_code: user.referral_code,
        apply_code: referralCode, // Newly added field
      },
    });
  } catch (error) {
    console.error("Error applying referral code:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close();
  }
}

module.exports = { applyReferralCode };
