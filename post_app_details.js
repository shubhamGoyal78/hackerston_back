const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function connectToAppDetailsDb() {
  try {
    await client.connect();
    const db = client.db("Hackerston");
    return db.collection("app_details");
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

async function postAppDetails(req, res) {
  try {
    const {
      title,
      steps,
      downloadLink,
      tutorialLink,
      screenshotLink,
      referralCode,
    } = req.body;

    // Validate that all required fields are provided
    if (!title || !steps || !downloadLink || !referralCode || !tutorialLink) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Ensure that 'steps' is an array of strings
    if (!Array.isArray(steps) || steps.length === 0) {
      return res
        .status(400)
        .json({ message: "Steps must be a non-empty array" });
    }

    const appDetailsCollection = await connectToAppDetailsDb();

    const newAppDetails = {
      title,
      steps,
      downloadLink,
      tutorialLink, // New field added
      screenshotLink,
      referralCode,
      createdAt: new Date(),
    };

    await appDetailsCollection.insertOne(newAppDetails);

    res.status(201).json({
      message: "App details stored successfully!",
      app_details: newAppDetails,
    });
  } catch (error) {
    console.error("Error posting app details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await client.close();
  }
}

module.exports = { postAppDetails };
