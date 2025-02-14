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
    await client.connect(); // Ensure the client is connected
    const db = client.db("Hackerston");
    return db.collection("users");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    throw error;
  }
}

// Function to add one coin to the user's balance
async function addOneCoin(req, res) {
  const userId = req.params.userId; // Extract userId from URL parameters

  if (!userId) {
    return res.status(400).json({ message: "User ID is required in URL" });
  }

  try {
    const usersCollection = await connectToUsersDb();

    // Find the user using `_id` (UUID as string)
    const user = await usersCollection.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add 1 coin using an atomic operation
    const result = await usersCollection.updateOne(
      { _id: userId },
      { $inc: { coins: 1 } }
    );

    if (result.modifiedCount === 1) {
      return res.status(200).json({
        message: "1 coin added successfully",
        newBalance: user.coins + 1,
      });
    } else {
      throw new Error("Failed to add coin");
    }
  } catch (error) {
    console.error("Error adding coin:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    // Close the client after the operation
    await client.close();
  }
}

module.exports = { addOneCoin };
