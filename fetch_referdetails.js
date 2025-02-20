const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToUsersDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston");
    return db.collection("users");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw error;
  }
}

async function fetchReferDetails(req, res) {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const usersCollection = await connectToUsersDb();

    // Find user by _id
    const user = await usersCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return only required fields
    const referralDetails = {
      referral_code: user.referral_code || null,
      referrals_count: user.referrals_count || 0,
      successful_count: user.successful_count || 0,
    };

    res.status(200).json(referralDetails);
  } catch (error) {
    console.error("Error fetching referral details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    // Do not close client here to keep the connection open for multiple requests
  }
}

module.exports = { fetchReferDetails };
