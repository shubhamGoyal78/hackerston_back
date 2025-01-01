const { MongoClient } = require("mongodb");

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

// Function to add coins to a user's account
async function addCoins(req, res) {
  const userId = req.params.userId; // Extract userId from URL parameters
  const coinsToAdd = parseInt(req.query.coins) || 1; // Coins to add (default is 1)

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const usersCollection = await connectToUsersDb(); // Connect to 'users' collection

    // Find the user by UUID (_id)
    const user = await usersCollection.findOne({ _id: userId });

    // If user does not exist, create a new document with initial coins
    if (!user) {
      const newUser = {
        _id: userId, // Use the UUID as _id directly
        coins: coinsToAdd, // Set initial coins value to coinsToAdd
      };
      await usersCollection.insertOne(newUser); // Insert the new user document
      return res.status(201).json({
        message: `New user created with ${coinsToAdd} coins`,
        coins: coinsToAdd,
      });
    }

    // Update the user's coins
    const updatedCoins = (user.coins || 0) + coinsToAdd;
    await usersCollection.updateOne(
      { _id: userId },
      { $set: { coins: updatedCoins } }
    );

    // Return the updated coins value
    res.status(200).json({
      message: `${coinsToAdd} coins added successfully`,
      coins: updatedCoins,
    });
  } catch (error) {
    console.error("Error adding coins:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { addCoins };
