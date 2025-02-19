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
    const { apply_coupon } = req.body; // Get coupon code from request body

    if (!userId || !apply_coupon) {
      return res
        .status(400)
        .json({ message: "User ID and coupon code are required" });
    }

    const usersCollection = await connectToDb();

    // Fetch user details
    const user = await usersCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent user from using their own referral code
    if (user.referral_code === apply_coupon) {
      return res
        .status(400)
        .json({ message: "You cannot use your own referral code." });
    }

    // Check if the referral code exists and get the referral user's details
    const referralUser = await usersCollection.findOne({
      referral_code: apply_coupon,
    });

    if (!referralUser) {
      return res.status(400).json({ message: "Invalid referral code." });
    }

    // Update the current user with the applied coupon and store the referral user's ID
    await usersCollection.updateOne(
      { _id: userId },
      {
        $set: {
          apply_coupon,
          referral_user: referralUser._id, // Storing the referral user's _id
        },
      }
    );

    return res.status(200).json({
      message: "Coupon code applied successfully",
      user: {
        _id: userId,
        email: user.email,
        apply_coupon,
        referral_user: referralUser._id, // Returning referral user ID in response
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
