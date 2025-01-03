const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
const uuid = require("uuid");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let clientConnected = false;

async function connectToCardDb() {
  if (!clientConnected) {
    await client.connect();
    clientConnected = true;
  }
  const db = client.db("Hackerston");
  return db.collection("cards");
}

async function fetchDownloadCoins(req, res) {
  const { unique_id } = req.query;

  if (!unique_id) {
    return res.status(400).json({ message: "unique_id is required" });
  }

  console.log("Unique ID:", unique_id);

  // Validate the UUID before making the query
  const queryUniqueId = uuid.validate(unique_id)
    ? unique_id
    : new ObjectId(unique_id); // You can adjust this based on how unique_id is stored (as UUID or ObjectId)

  try {
    const cardsCollection = await connectToCardDb();

    // Log the query
    console.log("Searching for unique_id in download_links array...");

    const card = await cardsCollection.findOne({
      "download_links.unique_id": queryUniqueId,
    });

    console.log("Fetched Card Document:", card);

    if (!card || !card.download_links || card.download_links.length === 0) {
      return res
        .status(404)
        .json({ message: "No download links found in the card" });
    }

    const downloadLink = card.download_links.find(
      (link) => link.unique_id === queryUniqueId
    );

    if (!downloadLink) {
      return res
        .status(404)
        .json({ message: "No download link found for the given unique_id" });
    }

    res.status(200).json({
      message: "Download link fetched successfully!",
      data: {
        title: downloadLink.title,
        coins: downloadLink.coins,
        link: downloadLink.link,
      },
    });
  } catch (error) {
    console.error("Error fetching download coins:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { fetchDownloadCoins };
