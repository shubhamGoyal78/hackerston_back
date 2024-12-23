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

// Function to fetch all cards
async function fetchAllCards(req, res) {
  try {
    const cardsCollection = await connectToCardDb(); // Connect to 'cards' collection

    // Fetch all documents from the collection
    const cards = await cardsCollection.find({}).toArray();

    if (cards.length === 0) {
      return res.status(404).json({ message: "No cards found" });
    }

    // Send all cards in the response
    res.status(200).json({
      message: "Cards fetched successfully!",
      cards: cards.map((card) => ({
        id: card._id,
        image: card.image,
        title: card.title,
        coins: card.coins,
        redirect: card.redirect, // Include redirect field
        createdAt: card.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching all cards:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { fetchAllCards };
