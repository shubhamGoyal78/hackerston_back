const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection URI and client setup
const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to the 'cards' collection
async function connectToCardDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston"); // Use the Hackerston database
    return db.collection("cards"); // Return 'cards' collection
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

// Function to fetch card information by _id (ObjectId)
async function fetchCardById(req, res) {
  try {
    const { id } = req.params; // Get the card id from URL params
    const cardsCollection = await connectToCardDb(); // Connect to 'cards' collection

    // Fetch the document by ObjectId
    const card = await cardsCollection.findOne({ _id: new ObjectId(id) });

    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    // Send the card details in the response
    res.status(200).json({
      message: "Card fetched successfully!",
      card: {
        image: card.image,
        title: card.title,
        coins: card.coins,
        createdAt: card.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching card by id:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { fetchCardById };
