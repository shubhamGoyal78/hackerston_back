const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid"); // Import uuid for generating unique IDs

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

// Function to handle card information storage
async function storeCardInfo(req, res) {
  try {
    const { image, title, coins, redirect } = req.body; // Extract data from request body

    // Validate input fields
    if (!image || !title || !coins || !redirect) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the 'image' field is a valid URL
    try {
      new URL(image); // Try to create a URL object to verify it's a valid URL
    } catch (error) {
      return res.status(400).json({ message: "Invalid image URL" });
    }

    const cardsCollection = await connectToCardDb(); // Connect to 'cards' collection

    // Create a new card object with a unique ID
    const newCard = {
      cardId: uuidv4(), // Generate a unique card ID
      image, // Store the image URL
      title,
      coins,
      redirect,
      createdAt: new Date(), // Add a timestamp
    };

    // Insert the new card into the collection
    await cardsCollection.insertOne(newCard);

    res.status(201).json({
      message: "Card information stored successfully!",
      card: {
        cardId: newCard.cardId,
        image, // Return the image URL
        title,
        coins,
        redirect,
      }, // Return card info
    });
  } catch (error) {
    console.error("Error storing card info:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { storeCardInfo };
