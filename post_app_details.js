const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToAppDetailsDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston");
    return db.collection("app_details");
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

async function postAppDetails(req, res) {
  try {
    const { title, coins } = req.body;

    if (!title || !coins) {
      return res.status(400).json({ message: "Title and coins are required" });
    }

    if (typeof coins !== "number" || coins < 0) {
      return res
        .status(400)
        .json({ message: "Coins must be a positive number" });
    }

    const appDetailsCollection = await connectToAppDetailsDb();

    const newAppDetails = {
      title,
      coins,
      createdAt: new Date(),
    };

    await appDetailsCollection.insertOne(newAppDetails);

    res.status(201).json({
      message: "App details stored successfully!",
      app_details: newAppDetails,
    });
  } catch (error) {
    console.error("Error posting app details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close();
  }
}

module.exports = { postAppDetails };
