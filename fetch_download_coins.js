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

// Function to fetch download coins by unique ID
async function fetchDownloadCoins(req, res) {
  const { unique_id } = req.query; // Get unique_id from query parameters

  if (!unique_id) {
    return res.status(400).json({ message: "unique_id is required" });
  }

  try {
    const cardsCollection = await connectToCardDb(); // Connect to 'cards' collection

    // Fetch the document that matches the unique_id in the download_links array
    const card = await cardsCollection.findOne({
      "download_links.unique_id": unique_id,
    });

    if (!card) {
      return res
        .status(404)
        .json({ message: "No data found for the given unique_id" });
    }

    // Extract the specific download link details
    const downloadLink = card.download_links.find(
      (link) => link.unique_id === unique_id
    );

    if (!downloadLink) {
      return res
        .status(404)
        .json({ message: "No download link found for the given unique_id" });
    }

    // Send the download link details in the response
    res.status(200).json({
      message: "Download link fetched successfully!",
      data: {
        title: downloadLink.title,
        coins: downloadLink.coins,
        link: downloadLink.link,
      },
    });
  } catch (error) {
    console.error("Error fetching download coins:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { fetchDownloadCoins };
