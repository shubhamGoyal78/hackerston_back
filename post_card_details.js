const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid"); // UUID library for generating unique IDs

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

// Function to post card details
async function postCardDetails(req, res) {
  try {
    const { working_video_link, download_links, apply_video_link } = req.body;

    // Validate input fields
    if (!working_video_link || !download_links || !apply_video_link) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure each download_link has a unique_id
    const processedDownloadLinks = download_links.map((link) => ({
      ...link,
      unique_id: link.unique_id || uuidv4(), // Generate a unique_id if not provided
    }));

    // Validate the URLs in the array
    try {
      new URL(working_video_link); // Validate working video URL
      new URL(apply_video_link); // Validate apply video URL
      processedDownloadLinks.forEach((link) => {
        new URL(link.link); // Validate each download link URL
      });
    } catch (error) {
      return res.status(400).json({ message: "Invalid video link URLs" });
    }

    const cardDetailsCollection = await connectToCardDetailsDb(); // Connect to 'card_details' collection

    // Create a new card details object
    const newCardDetails = {
      working_video_link,
      download_links: processedDownloadLinks,
      apply_video_link,
      createdAt: new Date(),
    };

    // Insert the new card details into the collection
    await cardDetailsCollection.insertOne(newCardDetails);

    res.status(201).json({
      message: "Card details stored successfully!",
      card_details: newCardDetails,
    });
  } catch (error) {
    console.error("Error posting card details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { postCardDetails };
