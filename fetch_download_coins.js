const { MongoClient } = require("mongodb");

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

  try {
    const cardsCollection = await connectToCardDb();

    const card = await cardsCollection.findOne({
      download_links: { $elemMatch: { unique_id: unique_id } },
    });

    if (!card || !card.download_links) {
      return res
        .status(404)
        .json({ message: "No download links found in the card" });
    }

    const downloadLink = card.download_links.find(
      (link) => link.unique_id === unique_id
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
