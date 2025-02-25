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
      const db = client.db("Hackerston");
      appDetailsCollection = db.collection("app_thumbnails");
      usersCollection = db.collection("users");
    } catch (error) {
      throw error;
    }
  }
  return { appDetailsCollection, usersCollection };
}

async function fetchAllAppInfo(req, res) {
  try {
    const { appDetailsCollection, usersCollection } =
      await connectToDatabases();
    const { userId } = req.query;

    let blockedApps = [];

    if (userId) {
      let userQuery = { _id: userId };
      if (ObjectId.isValid(userId)) {
        userQuery._id = new ObjectId(userId);
      }

      const user = await usersCollection.findOne(userQuery);

      if (user && user.blockedApps) {
        blockedApps = user.blockedApps.map((id) =>
          ObjectId.isValid(id) ? new ObjectId(id) : id
        );
      }
    }

    const allApps = await appDetailsCollection
      .find({ _id: { $nin: blockedApps } })
      .toArray();

    if (!allApps.length) {
      return res.status(404).json({ message: "No app details found" });
    }

    res
      .status(200)
      .json({ message: "App details fetched successfully", apps: allApps });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { fetchAllAppInfo };
