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

    // Fetch all documents from the collection
    const allApps = await appDetailsCollection.find({}).toArray();

    if (!allApps || allApps.length === 0) {
      console.warn("⚠️ No App Details Found");
      return res.status(404).json({ message: "No app details found" });
    }

    console.log("✅ App Details Fetched Successfully");
    res.status(200).json({
      message: "App details fetched successfully",
      apps: allApps, // Returning all app details
    });
  } catch (error) {
    console.error("❌ Error fetching all app details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { fetchAllAppInfo };
