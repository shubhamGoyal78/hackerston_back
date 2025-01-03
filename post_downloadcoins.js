const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection URI and client setup
const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to the "card_details" collection
async function connectToCardDetailsDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston"); // Use the Hackerston database
    return db.collection("card_details"); // Return the "card_details" collection
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

async function updateDownloadLinks(req, res) {
  const { cardId, downloadLinks } = req.body;

  if (!cardId || !Array.isArray(downloadLinks) || downloadLinks.length === 0) {
    return res.status(400).json({
      message: "cardId and a non-empty array of downloadLinks are required",
    });
  }

  try {
    console.log("Connecting to card_details collection...");
    const cardDetailsCollection = await connectToCardDetailsDb();

    console.log("Updating document with cardId:", cardId);
    const result = await cardDetailsCollection.updateOne(
      { _id: ObjectId(cardId) },
      { $set: { download_links: downloadLinks } }
    );

    console.log("Update result:", result);

    if (result.modifiedCount > 0) {
      return res
        .status(200)
        .json({ message: "Download links updated successfully" });
    } else {
      return res.status(404).json({ message: "Card not found or not updated" });
    }
  } catch (error) {
    console.error("Error updating download links:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  } finally {
    try {
      await client.close();
      console.log("Database connection closed.");
    } catch (closeError) {
      console.error("Error closing database connection:", closeError);
    }
  }
}

module.exports = { updateDownloadLinks };
