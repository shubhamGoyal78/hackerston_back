const { MongoClient, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToAppDetailsDb() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("Hackerston").collection("app_details");
}

async function fetchAppDetails(req, res) {
  try {
    const { id } = req.params; // Expecting the _id in the URL parameter

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const appDetailsCollection = await connectToAppDetailsDb();

    const appDetails = await appDetailsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!appDetails) {
      return res.status(404).json({ message: "App details not found" });
    }

    res.status(200).json({
      message: "App details fetched successfully",
      app_details: appDetails,
    });
  } catch (error) {
    console.error("Error fetching app details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { fetchAppDetails };
