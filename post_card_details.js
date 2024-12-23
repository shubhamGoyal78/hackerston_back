const { MongoClient } = require("mongodb");

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
    const { working_video_link, download_links, apply_video_link } = req.body; // Extract data from request body

    // Validate input fields
    if (!working_video_link || !download_links || !apply_video_link) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate download_links (must be an array of objects with title, coins, and link)
    if (
      !Array.isArray(download_links) ||
      download_links.some((link) => !link.title || !link.coins || !link.link)
    ) {
      return res
        .status(400)
        .json({
          message: "Each download link must have title, coins, and link fields",
        });
    }

    // Check if the 'working_video_link' and 'apply_video_link' are valid URLs
    try {
      new URL(working_video_link); // Try to create a URL object to verify it's a valid URL
      new URL(apply_video_link);
      download_links.forEach((link) => {
        new URL(link.link); // Validate each download link URL
      });
    } catch (error) {
      return res.status(400).json({ message: "Invalid video link URLs" });
    }

    const cardDetailsCollection = await connectToCardDetailsDb(); // Connect to 'card_details' collection

    // Create a new card details object
    const newCardDetails = {
      working_video_link, // Store the working video URL
      download_links, // Store the download links with title, coins, and link
      apply_video_link, // Store the apply video link URL
      createdAt: new Date(), // Add a timestamp
    };

    // Insert the new card details into the collection
    await cardDetailsCollection.insertOne(newCardDetails);

    res.status(201).json({
      message: "Card details stored successfully!",
      card_details: {
        working_video_link,
        download_links,
        apply_video_link,
      }, // Return card details info
    });
  } catch (error) {
    console.error("Error posting card details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close(); // Ensure client is closed
  }
}

module.exports = { postCardDetails };
