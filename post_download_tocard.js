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
    return db.collection("card_details"); // Return "card_details" collection
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

// Function to update card_details with download_links
async function updateCardDetails(req, res) {
  const { cardId, downloadLinkIds } = req.body; // Extract cardId and downloadLinkIds from request body

  // Validate input
  if (
    !cardId ||
    !Array.isArray(downloadLinkIds) ||
    downloadLinkIds.length === 0
  ) {
    return res.status(400).json({
      message: "cardId and an array of downloadLinkIds are required",
    });
  }

  try {
    const cardDetailsCollection = await connectToCardDetailsDb(); // Connect to "card_details" collection

    // Update the card_details document
    const result = await cardDetailsCollection.updateOne(
      { _id: ObjectId(cardId) }, // Match the card by its _id
      {
        $set: {
          download_links: downloadLinkIds.map((id) => ObjectId(id)), // Convert downloadLinkIds to ObjectId array
        },
      }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Card updated successfully" });
    } else {
      res.status(404).json({ message: "Card not found or not updated" });
    }
  } catch (error) {
    console.error("Error updating card details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure the client is closed
  }
}

module.exports = { updateCardDetails };
