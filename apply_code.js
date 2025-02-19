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

// Function to apply a coupon code
async function applyReferralCode(req, res) {
  try {
    const { userId } = req.params; // Get user ID from URL
    const { apply_coupon } = req.body; // Get coupon code from request body

    if (!userId || !apply_coupon) {
      return res
        .status(400)
        .json({ message: "User ID and coupon code are required" });
    }

    const usersCollection = await connectToDb();

    // Check if the user exists
    const user = await usersCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only the 'apply_coupon' field without modifying others
    await usersCollection.updateOne(
      { _id: userId }, // Keep as a string
      { $set: { apply_coupon } }
    );

    return res.status(200).json({
      message: "Coupon code applied successfully",
      user: {
        _id: userId,
        email: user.email,
        apply_coupon, // Only this field is updated
      },
    });
  } catch (error) {
    console.error("Error applying coupon code:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close();
  }
}

module.exports = { applyReferralCode };
