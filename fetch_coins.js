// fetch_coins.js

const { MongoClient, ObjectId } = require("mongodb");

// MongoDB connection URI and client setup
const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to the 'users' collection
async function connectToUsersDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston"); // Use the Hackerston database
    return db.collection("users"); // Return 'users' collection
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

// Function to fetch coins by user _id
async function fetchCoins(req, res) {
  const userId = req.params.id; // Get the user ID from the request parameters

  try {
    const usersCollection = await connectToUsersDb(); // Connect to 'users' collection

    // Find the user by UUID _id (string format)
    const user = await usersCollection.findOne({ _id: userId });

    // If user does not exist, create a new document with coins field set to 0
    if (!user) {
      const newUser = {
        _id: userId, // Use the UUID as _id directly
        coins: 0, // Set initial coins value to 0
      };
      await usersCollection.insertOne(newUser); // Insert the new user document
      return res
        .status(201)
        .json({ message: "New user created with 0 coins", coins: 0 });
    }

    // If the user exists, return the coins value
    res.status(200).json({
      message: "Coins fetched successfully",
      coins: user.coins || 0, // Ensure coins field exists, return 0 if undefined
    });
  } catch (error) {
    console.error("Error fetching coins:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { fetchCoins };
