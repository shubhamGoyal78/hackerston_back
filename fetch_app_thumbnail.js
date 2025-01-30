const { MongoClient, ObjectId } = require("mongodb");

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

async function fetchAppInfo(req, res) {
  try {
    const { id } = req.params;
    console.log("🔍 Fetching App Details for ID:", id);

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const appDetailsCollection = await connectToAppDetailsDb();

    // Fetch full app details by `_id`
    const appInfo = await appDetailsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!appInfo) {
      console.warn("⚠️ App Details Not Found:", id);
      return res.status(404).json({ message: "App details not found" });
    }

    console.log("✅ App Details Found:", appInfo);
    res.status(200).json({
      message: "App details fetched successfully",
      app_info: appInfo, // Returning full details
    });
  } catch (error) {
    console.error("❌ Error fetching app details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { fetchAppInfo };
