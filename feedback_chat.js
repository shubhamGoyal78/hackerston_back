const { MongoClient, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://subhamgoyal08:ON0EmEDfqU6CXdlr@hackerston.7tunh.mongodb.net/?retryWrites=true&w=majority&appName=hackerston";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to the 'feedback' collection
async function connectToFeedbackCollection() {
  try {
    await client.connect();
    const db = client.db("Hackerston"); // Use the Hackerston database
    return db.collection("feedback"); // Return 'feedback' collection
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}

// Function to submit feedback message
async function submitFeedback(req, res) {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res
        .status(400)
        .json({ message: "User ID and message are required" });
    }

    const feedbackCollection = await connectToFeedbackCollection();

    const newFeedback = {
      userId,
      message,
      response: null, // Initially, no response from admin
      createdAt: new Date(),
    };

    await feedbackCollection.insertOne(newFeedback);

    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Function to fetch a user's feedback messages
async function fetchUserFeedback(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const feedbackCollection = await connectToFeedbackCollection();
    const userFeedback = await feedbackCollection.find({ userId }).toArray();

    res.status(200).json(userFeedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Function for the admin to respond to a feedback message
async function respondToFeedback(req, res) {
  try {
    const { feedbackId } = req.params;
    const { response } = req.body;

    if (!feedbackId || !response) {
      return res
        .status(400)
        .json({ message: "Feedback ID and response are required" });
    }

    const feedbackCollection = await connectToFeedbackCollection();
    const result = await feedbackCollection.updateOne(
      { _id: new ObjectId(feedbackId) },
      { $set: { response } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json({ message: "Response added successfully" });
  } catch (error) {
    console.error("Error responding to feedback:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

module.exports = { submitFeedback, fetchUserFeedback, respondToFeedback };
