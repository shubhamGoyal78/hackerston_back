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

// Function to fetch coins using UUID
async function fetchCoins(req, res) {
  const userId = req.params.userId; // Extract userId from URL parameters

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const usersCollection = await connectToUsersDb(); // Connect to 'users' collection

    // Find the user by UUID (_id)
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

    // If the user exists and the coins field is missing, add it
    if (user.coins === undefined) {
      await usersCollection.updateOne(
        { _id: userId },
        { $set: { coins: 0 } } // Set the coins field to 0
      );
    }

    // Return the coins value (ensure it exists)
    res.status(200).json({
      message: "Coins fetched successfully",
      coins: user.coins || 0, // Return coins (0 if undefined)
    });
  } catch (error) {
    console.error("Error fetching coins:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { fetchCoins };
