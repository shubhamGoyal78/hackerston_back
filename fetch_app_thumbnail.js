const { MongoClient, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";

let client;
let appThumbnailCollection;

// Connect only once and reuse the connection
async function connectToAppThumbnailDb() {
  if (!client) {
    try {
      client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      await client.connect();
      console.log("✅ Connected to MongoDB");
      const db = client.db("Hackerston");
      appThumbnailCollection = db.collection("app_thumbnail");
    } catch (error) {
      console.error("❌ Failed to connect to the database", error);
      throw error;
    }
  }
  return appThumbnailCollection;
}

async function fetchAppThumbnail(req, res) {
  try {
    const { id } = req.params;
    console.log("🔍 Fetching App Thumbnail for ID:", id);

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const appThumbnailCollection = await connectToAppThumbnailDb();

    const appThumbnail = await appThumbnailCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!appThumbnail) {
      console.warn("⚠️ App Thumbnail Not Found:", id);
      return res.status(404).json({ message: "App thumbnail not found" });
    }

    console.log("✅ App Thumbnail Found:", appThumbnail);
    res.status(200).json({
      message: "App thumbnail fetched successfully",
      app_thumbnail: appThumbnail,
    });
  } catch (error) {
    console.error("❌ Error fetching app thumbnail:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { fetchAppThumbnail };
