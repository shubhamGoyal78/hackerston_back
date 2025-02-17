const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToTelegramLinkDb() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db("Hackerston").collection("telegram_link");
}

async function fetchTelegramLink(req, res) {
  try {
    const telegramLinkCollection = await connectToTelegramLinkDb();

    // Fetch the first document from the collection
    const telegramLink = await telegramLinkCollection.findOne({});

    console.log("Fetched Telegram Link Document:", telegramLink); // Debugging

    if (!telegramLink) {
      return res
        .status(404)
        .json({ message: "No document found in telegram_link collection" });
    }

    if (!telegramLink.correct_url) {
      return res
        .status(404)
        .json({ message: "correct_url field is missing in the document" });
    }

    res.status(200).json({
      message: "Telegram link fetched successfully",
      correct_url: telegramLink.correct_url,
    });
  } catch (error) {
    console.error("Error fetching Telegram link:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { fetchTelegramLink };
