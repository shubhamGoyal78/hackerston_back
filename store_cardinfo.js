const { MongoClient } = require("mongodb");

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

// Function to post card information
async function postCardInfo(req, res) {
  try {
    const { image, title, coins, redirect } = req.body; // Extract data from request body

    // Validate input fields
    if (!image || !title || !coins || !redirect) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the 'redirect' is a valid URL or a passcode
    if (redirect.includes("http://") || redirect.includes("https://")) {
      try {
        new URL(redirect); // Validate if redirect is a valid URL
      } catch (error) {
        return res.status(400).json({ message: "Invalid redirect URL" });
      }
    }

    const cardsCollection = await connectToCardDb(); // Connect to 'cards' collection

    // Create a new card object
    const newCard = {
      image,
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
        image,
        title,
        coins,
        redirect,
      },
    });
  } catch (error) {
    console.error("Error posting card info:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { postCardInfo };
