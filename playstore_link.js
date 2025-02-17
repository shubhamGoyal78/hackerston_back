const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToPlaystoreLinkDb() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("Hackerston").collection("Playstore_link");
}

async function fetchPlaystoreLink(req, res) {
  try {
    const PlaystoreLinkCollection = await connectToPlaystoreLinkDb();

    // Fetch the first document from the collection
    const PlaystoreLink = await PlaystoreLinkCollection.findOne({});

    console.log("Fetched Playstore Link Document:", PlaystoreLink); // Debugging

    if (!PlaystoreLink) {
      return res
        .status(404)
        .json({ message: "No document found in Playstore_link collection" });
    }

    if (!PlaystoreLink.correct_url) {
      return res
        .status(404)
        .json({ message: "correct_url field is missing in the document" });
    }

    res.status(200).json({
      message: "Playstore link fetched successfully",
      correct_url: PlaystoreLink.correct_url,
    });
  } catch (error) {
    console.error("Error fetching Playstore link:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { fetchPlaystoreLink };
