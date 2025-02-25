const { MongoClient, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";

let client;
let appDetailsCollection;
let usersCollection;

// Connect only once and reuse the connection
async function connectToDatabases() {
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
      usersCollection = db.collection("users");
    } catch (error) {
      console.error("❌ Failed to connect to the database", error);
      throw error;
    }
  }
  return { appDetailsCollection, usersCollection };
}

async function fetchAllAppInfo(req, res) {
  try {
    console.log("🔍 Fetching All App Details");

    const { appDetailsCollection, usersCollection } =
      await connectToDatabases();
    const userId = req.query.userId;

    let blockedAppIds = [];

    if (userId) {
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

      if (user?.blockedApps?.length) {
        blockedAppIds = user.blockedApps
          .map((id) => {
            try {
              return new ObjectId(id);
            } catch (error) {
              console.warn(`⚠️ Invalid ObjectId: ${id}`);
              return null;
            }
          })
          .filter((id) => id !== null); // Remove invalid IDs
      }
    }

    console.log("Blocked App IDs:", blockedAppIds); // Debugging

    // Fetch all apps except blocked ones
    const allApps = await appDetailsCollection
      .find({ _id: { $nin: blockedAppIds } })
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
