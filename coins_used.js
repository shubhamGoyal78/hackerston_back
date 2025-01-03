const { MongoClient } = require("mongodb");

// MongoDB connection URI and client setup
const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to a specific collection
async function connectTousers(users) {
  try {
    await client.connect();
    const db = client.db("Hackerston"); // Use the Hackerston database
    return db.collection(users); // Return the specified collection
  } catch (error) {
    console.error(`Failed to connect to the ${users} collection`, error);
    throw error;
  }
}

// Function to deduct coins for a download
async function deductCoins(req, res) {
  const userId = req.params.userId; // Extract userId from URL parameters
  const title = req.query.title; // Title of the download link

  if (!userId || !title) {
    return res.status(400).json({ message: "User ID and title are required" });
  }

  try {
    // Connect to the necessary collections
    const usersCollection = await connectToCollection("users");
    const cardDetailsCollection = await connectToCollection("card_details");

    // Find the user
    const user = await usersCollection.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the download link by title
    const cardDetails = await cardDetailsCollection.findOne({ userId }); // Assuming `userId` links the user to their card details
    if (!cardDetails || !cardDetails.download_links) {
      return res.status(404).json({ message: "Download links not found" });
    }

    const downloadLink = cardDetails.download_links.find(
      (link) => link.title === title
    );

    if (!downloadLink) {
      return res.status(404).json({ message: "Download link not found" });
    }

    const coinsToDeduct = downloadLink.coins;
    if (user.coins < coinsToDeduct) {
      return res.status(400).json({ message: "Insufficient coins" });
    }

    // Deduct the coins
    const updatedCoins = user.coins - coinsToDeduct;
    await usersCollection.updateOne(
      { _id: userId },
      { $set: { coins: updatedCoins } }
    );

    // Return the updated coin balance
    res.status(200).json({
      message: `${coinsToDeduct} coins deducted successfully`,
      coins: updatedCoins,
      downloadLink,
    });
  } catch (error) {
    console.error("Error deducting coins:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { deductCoins };
