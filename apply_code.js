const { MongoClient, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToDb() {
  await client.connect();
  const db = client.db("Hackerston");
  return db.collection("users");
}

async function applyReferralCode(req, res) {
  try {
    const { userId } = req.params;
    const { referralCode } = req.body; // This is the referral code the user enters (friend's code)

    if (!userId || !referralCode) {
      return res
        .status(400)
        .json({ message: "User ID and referral code are required" });
    }

    const usersCollection = await connectToDb();

    // Check if the user exists
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure the user is not applying their own referral code
    if (user.referral_code === referralCode) {
      return res
        .status(400)
        .json({ message: "You cannot use your own referral code." });
    }

    // Check if the referral code exists in the database (must belong to another user)
    const referrer = await usersCollection.findOne({
      referral_code: referralCode,
    });
    if (!referrer) {
      return res.status(400).json({ message: "Invalid referral code." });
    }

    // Update the user's document to include the applied referral code
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { apply_code: referralCode } }
    );

    return res.status(200).json({
      message: "Referral code applied successfully",
      user: {
        _id: userId,
        email: user.email,
        referral_code: user.referral_code, // User's own referral code
        apply_code: referralCode, // Code they applied (friend's referral code)
      },
    });
  } catch (error) {
    console.error("Error applying referral code:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { applyReferralCode };
