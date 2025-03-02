const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToVideoLinkDb() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("Hackerston").collection("Video_link");
}

async function fetchVideoLink(req, res) {
  try {
    const VideoLinkCollection = await connectToVideoLinkDb();

    // Fetch the first document from the collection
    const VideoLink = await VideoLinkCollection.findOne({});

    console.log("Fetched Video Link Document:", VideoLink); // Debugging

    if (!VideoLink) {
      return res
        .status(404)
        .json({ message: "No document found in Video_link collection" });
    }

    if (!VideoLink.correct_url) {
      return res
        .status(404)
        .json({ message: "correct_url field is missing in the document" });
    }

    res.status(200).json({
      message: "Video link fetched successfully",
      correct_url: VideoLink.correct_url,
    });
  } catch (error) {
    console.error("Error fetching Video link:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { fetchVideoLink };
