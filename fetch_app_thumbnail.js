const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";

let client;
let appDetailsCollection;

// Connect only once and reuse the connection
async function connectToAppDetailsDb() {
  if (!client) {
    try {
      client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      await client.connect();
      console.log("✅ Connected to MongoDB");
      const db = client.db("Hackerston");
      appDetailsCollection = db.collection("app_thumbnails");
    } catch (error) {
      console.error("❌ Failed to connect to the database", error);
      throw error;
    }
  }
  return appDetailsCollection;
}

async function fetchAllAppInfo(req, res) {
  try {
    console.log("🔍 Fetching All App Details");

    const appDetailsCollection = await connectToAppDetailsDb();
    const usersCollection = await connectToUsersDb();

    const userId = req.query.userId; // Pass user ID as a query param
    let blockedApps = [];

    if (userId) {
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      blockedApps = user?.blockedApps || [];
    }

    // Fetch all apps except blocked ones
    const allApps = await appDetailsCollection
      .find({ _id: { $nin: blockedApps.map((id) => new ObjectId(id)) } })
      .toArray();

    if (!allApps.length) {
      return res.status(404).json({ message: "No app details found" });
    }

    res
      .status(200)
      .json({ message: "App details fetched successfully", apps: allApps });
  } catch (error) {
    console.error("❌ Error fetching all app details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { fetchAllAppInfo };
