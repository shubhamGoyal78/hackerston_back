const { MongoClient, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";

let client;
let usersCollection;

// Connect to MongoDB (Singleton Pattern)
async function connectToUsersDb() {
  if (!client) {
    try {
      client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      await client.connect();
      console.log("✅ Connected to MongoDB");
      const db = client.db("Hackerston");
      usersCollection = db.collection("users");
    } catch (error) {
      console.error("❌ Failed to connect to the database", error);
      throw error;
    }
  }
  return usersCollection;
}

// Block an app for a specific user
async function blockApp(req, res) {
  try {
    const { userId, appId } = req.body;

    if (!userId || !appId) {
      return res
        .status(400)
        .json({ message: "User ID and App ID are required" });
    }

    const usersCollection = await connectToUsersDb();

    // Convert userId to ObjectId
    const userObjectId = new ObjectId(userId);

    // Check if the user exists
    const user = await usersCollection.findOne({ _id: userObjectId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert appId to ObjectId only if it's a valid ObjectId
    const appIdToStore = ObjectId.isValid(appId) ? new ObjectId(appId) : appId;

    // Update user document by adding appId to blockedApps array
    await usersCollection.updateOne(
      { _id: userObjectId }, // Corrected lookup
      { $addToSet: { blockedApps: appIdToStore } } // Prevents duplicates
    );

    res.status(200).json({ message: "App blocked successfully" });
  } catch (error) {
    console.error("❌ Error blocking app:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { blockApp };
