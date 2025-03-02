const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToDownloadLinkDb() {
  await client.connect(); // Ensures the connection
  return client.db("Hackerston").collection("download_link");
}

async function fetchdownloadLink(req, res) {
  try {
    const downloadLinkCollection = await connectToDownloadLinkDb();

    // Fetch the first document from the collection
    const downloadLink = await downloadLinkCollection.findOne({});

    console.log("Fetched download Link Document:", downloadLink); // Debugging

    if (!downloadLink) {
      return res
        .status(404)
        .json({ message: "No document found in download_link collection" });
    }

    if (!downloadLink.correct_url) {
      return res
        .status(404)
        .json({ message: "correct_url field is missing in the document" });
    }

    res.status(200).json({
      message: "Download link fetched successfully",
      correct_url: downloadLink.correct_url,
    });
  } catch (error) {
    console.error("Error fetching download link:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { fetchdownloadLink };
