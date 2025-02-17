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

    // Assuming there's only one document in the collection
    const telegramLink = await telegramLinkCollection.findOne({});

    if (!telegramLink || !telegramLink.correct_url) {
      return res.status(404).json({ message: "Telegram link not found" });
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
