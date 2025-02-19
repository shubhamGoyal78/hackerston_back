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

// Function to check if a user has applied a coupon code
async function checkAppliedCoupon(req, res) {
  try {
    const { userId } = req.params; // Get user ID from URL

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const usersCollection = await connectToDb();

    // Fetch user details
    const user = await usersCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has applied a coupon
    if (!user.apply_coupon) {
      return res
        .status(200)
        .json({ message: "No coupon applied", applied: false });
    }

    return res.status(200).json({
      message: "Coupon found",
      applied: true,
      apply_coupon: user.apply_coupon,
    });
  } catch (error) {
    console.error("Error checking applied coupon:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close();
  }
}

module.exports = { checkAppliedCoupon };
