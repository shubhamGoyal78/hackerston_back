const { MongoClient, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToAppThumbnailDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston");
    return db.collection("app_thumbnail");
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

async function fetchAppThumbnail(req, res) {
  try {
    const { id } = req.params; // Expecting the _id in the URL parameter

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const appThumbnailCollection = await connectToAppThumbnailDb();

    const appThumbnail = await appThumbnailCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!appThumbnail) {
      return res.status(404).json({ message: "App thumbnail not found" });
    }

    res.status(200).json({
      message: "App thumbnail fetched successfully",
      app_thumbnail: appThumbnail,
    });
  } catch (error) {
    console.error("Error fetching app thumbnail:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close();
  }
}

module.exports = { fetchAppThumbnail };
