const { MongoClient } = require("mongodb");

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
    return db.collection("app_thumbnails"); // You may choose a different collection name
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

async function postAppThumbnail(req, res) {
  try {
    const { title, coins, imagelink, redirect } = req.body;

    if (!title || !coins || !imagelink || !redirect) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure that 'coins' is a valid number
    if (isNaN(coins)) {
      return res.status(400).json({ message: "Coins must be a number" });
    }

    const appThumbnailCollection = await connectToAppThumbnailDb();

    const newAppThumbnail = {
      title,
      coins,
      imagelink,
      redirect,
      createdAt: new Date(),
    };

    await appThumbnailCollection.insertOne(newAppThumbnail);

    res.status(201).json({
      message: "App thumbnail stored successfully!",
      app_thumbnail: newAppThumbnail,
    });
  } catch (error) {
    console.error("Error posting app thumbnail:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close();
  }
}

module.exports = { postAppThumbnail };
