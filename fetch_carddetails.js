const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection URI and client setup
const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to the 'card_details' collection
async function connectToCardDetailsDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston"); // Use the Hackerston database
    return db.collection("card_details"); // Return 'card_details' collection
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

// Function to fetch card details by _id
async function fetchCardDetails(req, res) {
  try {
    const { id } = req.params; // Extract the _id from request parameters

    // Validate _id format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const cardDetailsCollection = await connectToCardDetailsDb(); // Connect to 'card_details' collection

    // Fetch card details by _id
    const cardDetails = await cardDetailsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!cardDetails) {
      return res.status(404).json({ message: "Card details not found" });
    }

    res.status(200).json({
      message: "Card details fetched successfully!",
      card_details: cardDetails, // Return fetched card details
    });
  } catch (error) {
    console.error("Error fetching card details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { fetchCardDetails };
