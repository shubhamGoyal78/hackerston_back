const { MongoClient } = require("mongodb");

// MongoDB connection URI and client setup
const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to the "download_links" collection
async function connectToDownloadLinksDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston"); // Use the Hackerston database
    return db.collection("download_links"); // Return "download_links" collection
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

// Function to post a new document to the "download_links" collection
async function postDownloadLink(req, res) {
  const { title, coins, link } = req.body; // Extract the fields from the request body

  // Validate input
  if (!title || !coins || !link) {
    return res
      .status(400)
      .json({ message: "Title, Coins, and Link are required" });
  }

  try {
    const downloadLinksCollection = await connectToDownloadLinksDb(); // Connect to "download_links" collection

    // Create a new document
    const newDocument = {
      title,
      coins,
      link,
    };

    // Insert the document into the collection
    const result = await downloadLinksCollection.insertOne(newDocument);

    // Respond with the inserted document's _id
    res.status(201).json({
      message: "Document added successfully",
      documentId: result.insertedId,
    });
  } catch (error) {
    console.error("Error posting download link:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure the client is closed
  }
}

module.exports = { postDownloadLink };
